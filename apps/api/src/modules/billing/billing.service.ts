import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus, PaymentMethod } from './invoice.entity';
import { InvoiceItem, ItemType } from './invoice-item.entity';
import { Payment, PaymentStatus } from './payment.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private invoiceItemRepository: Repository<InvoiceItem>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async createInvoice(createInvoiceDto: CreateInvoiceDto, userId: string, tenantId: string): Promise<Invoice> {
    
    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber(tenantId);
    
    // Calculate totals
    const subtotal = createInvoiceDto.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const taxAmount = createInvoiceDto.tax_amount || 0;
    const discountAmount = createInvoiceDto.discount_amount || 0;
    const totalAmount = subtotal + taxAmount - discountAmount;

    const invoice = this.invoiceRepository.create({
      ...createInvoiceDto,
      tenant: { id: tenantId },
      created_by: { id: userId },
      invoice_number: invoiceNumber,
      subtotal,
      tax_amount: taxAmount,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      balance_due: totalAmount,
      items: createInvoiceDto.items.map(item => ({
        ...item,
        total_amount: item.quantity * item.unit_price,
        tenant: { id: tenantId },
      })),
    });

    return this.invoiceRepository.save(invoice);
  }

  async findAllInvoices(tenantId: string, filters?: any): Promise<Invoice[]> {
    
    const queryBuilder = this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.client', 'client')
      .leftJoinAndSelect('invoice.case', 'case')
      .leftJoinAndSelect('invoice.created_by', 'created_by')
      .leftJoinAndSelect('invoice.items', 'items')
      .where('invoice.tenantId = :tenantId', { tenantId })
      .andWhere('invoice.is_active = true');

    if (filters?.clientId) {
      queryBuilder.andWhere('invoice.clientId = :clientId', { clientId: filters.clientId });
    }

    if (filters?.caseId) {
      queryBuilder.andWhere('invoice.caseId = :caseId', { caseId: filters.caseId });
    }

    if (filters?.status) {
      queryBuilder.andWhere('invoice.status = :status', { status: filters.status });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(invoice.title ILIKE :search OR invoice.invoice_number ILIKE :search OR client.first_name ILIKE :search OR client.last_name ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    return queryBuilder.orderBy('invoice.created_at', 'DESC').getMany();
  }

  async findInvoiceById(id: string, tenantId: string): Promise<Invoice> {
    
    const invoice = await this.invoiceRepository.findOne({
      where: { id, tenant: { id: tenantId }, is_active: true },
      relations: ['client', 'case', 'created_by', 'items'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async updateInvoice(id: string, updateInvoiceDto: UpdateInvoiceDto, tenantId: string): Promise<Invoice> {
    
    const invoice = await this.invoiceRepository.findOne({
      where: { id, tenant: { id: tenantId }, is_active: true },
      relations: ['items'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Update invoice fields
    Object.assign(invoice, updateInvoiceDto);

    // Update items if provided
    if (updateInvoiceDto.items) {
      // Remove existing items
      await this.invoiceItemRepository.delete({ invoice: { id } });
      
      // Add new items
      const newItems = updateInvoiceDto.items.map(item => ({
        ...item,
        total_amount: item.quantity * item.unit_price,
        tenant: { id: tenantId },
      }));
      
      // Create and save new items
      const savedItems = await Promise.all(
        newItems.map(item => this.invoiceItemRepository.save(item))
      );
      invoice.items = savedItems;
    }

    // Recalculate totals
    const subtotal = (invoice.items || []).reduce((sum, item) => sum + item.total_amount, 0);
    const taxAmount = invoice.tax_amount || 0;
    const discountAmount = invoice.discount_amount || 0;
    const totalAmount = subtotal + taxAmount - discountAmount;

    invoice.subtotal = subtotal;
    invoice.total_amount = totalAmount;
    invoice.balance_due = totalAmount - invoice.paid_amount;

    return this.invoiceRepository.save(invoice);
  }

  async deleteInvoice(id: string, tenantId: string): Promise<void> {
    
    const invoice = await this.invoiceRepository.findOne({
      where: { id, tenant: { id: tenantId }, is_active: true },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Soft delete
    invoice.is_active = false;
    await this.invoiceRepository.save(invoice);
  }

  async createPayment(createPaymentDto: CreatePaymentDto, userId: string, tenantId: string): Promise<Payment> {
    
    // Verify invoice exists and belongs to tenant
    const invoice = await this.invoiceRepository.findOne({
      where: { id: createPaymentDto.invoiceId, tenant: { id: tenantId }, is_active: true },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Generate payment number
    const paymentNumber = await this.generatePaymentNumber(tenantId);

    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      tenant: { id: tenantId },
      client: { id: invoice.client.id },
      processed_by: { id: userId },
      payment_number: paymentNumber,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // Update invoice paid amount and status
    const totalPaid = await this.calculateTotalPaidForInvoice(invoice.id);
    invoice.paid_amount = totalPaid;
    invoice.balance_due = invoice.total_amount - totalPaid;
    
    if (invoice.balance_due <= 0) {
      invoice.status = InvoiceStatus.PAID;
      invoice.paid_date = new Date();
    } else if (invoice.balance_due < invoice.total_amount) {
      invoice.status = InvoiceStatus.PARTIALLY_PAID;
    }

    await this.invoiceRepository.save(invoice);

    return savedPayment;
  }

  async findAllPayments(tenantId: string, filters?: any): Promise<Payment[]> {
    
    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.invoice', 'invoice')
      .leftJoinAndSelect('payment.client', 'client')
      .leftJoinAndSelect('payment.processed_by', 'processed_by')
      .where('payment.tenantId = :tenantId', { tenantId })
      .andWhere('payment.is_active = true');

    if (filters?.invoiceId) {
      queryBuilder.andWhere('payment.invoiceId = :invoiceId', { invoiceId: filters.invoiceId });
    }

    if (filters?.clientId) {
      queryBuilder.andWhere('payment.clientId = :clientId', { clientId: filters.clientId });
    }

    if (filters?.status) {
      queryBuilder.andWhere('payment.status = :status', { status: filters.status });
    }

    return queryBuilder.orderBy('payment.created_at', 'DESC').getMany();
  }

  async findPaymentById(id: string, tenantId: string): Promise<Payment> {
    
    const payment = await this.paymentRepository.findOne({
      where: { id, tenant: { id: tenantId }, is_active: true },
      relations: ['invoice', 'client', 'processed_by'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  private async generateInvoiceNumber(tenantId: string): Promise<string> {
    const currentYear = new Date().getFullYear();
    const count = await this.invoiceRepository.count({
      where: { tenant: { id: tenantId } },
    });
    
    return `INV-${currentYear}-${(count + 1).toString().padStart(4, '0')}`;
  }

  private async generatePaymentNumber(tenantId: string): Promise<string> {
    const currentYear = new Date().getFullYear();
    const count = await this.paymentRepository.count({
      where: { tenant: { id: tenantId } },
    });
    
    return `PAY-${currentYear}-${(count + 1).toString().padStart(4, '0')}`;
  }

  private async calculateTotalPaidForInvoice(invoiceId: string): Promise<number> {
    const payments = await this.paymentRepository.find({
      where: { 
        invoice: { id: invoiceId }, 
        status: PaymentStatus.COMPLETED,
        is_active: true 
      },
    });

    return payments.reduce((sum, payment) => sum + payment.amount, 0);
  }
}
