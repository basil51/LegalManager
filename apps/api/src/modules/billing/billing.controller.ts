import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CurrentTenant } from '../tenants/tenant-context.decorator';
import { BillingService } from './billing.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Invoice } from './invoice.entity';
import { Payment } from './payment.entity';

@ApiTags('billing')
@Controller('billing')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('invoices')
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createInvoice(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<Invoice> {
    return this.billingService.createInvoice(createInvoiceDto, user.id, tenantId);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Get all invoices with optional filtering' })
  @ApiResponse({ status: 200, description: 'Invoices retrieved successfully' })
  async findAllInvoices(@Query() filters: any, @CurrentTenant() tenantId: string): Promise<Invoice[]> {
    return this.billingService.findAllInvoices(tenantId, filters);
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiResponse({ status: 200, description: 'Invoice retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async findInvoiceById(@Param('id') id: string, @CurrentTenant() tenantId: string): Promise<Invoice> {
    return this.billingService.findInvoiceById(id, tenantId);
  }

  @Patch('invoices/:id')
  @ApiOperation({ summary: 'Update an invoice' })
  @ApiResponse({ status: 200, description: 'Invoice updated successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async updateInvoice(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
    @CurrentTenant() tenantId: string,
  ): Promise<Invoice> {
    return this.billingService.updateInvoice(id, updateInvoiceDto, tenantId);
  }

  @Delete('invoices/:id')
  @ApiOperation({ summary: 'Delete an invoice' })
  @ApiResponse({ status: 200, description: 'Invoice deleted successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async deleteInvoice(@Param('id') id: string, @CurrentTenant() tenantId: string): Promise<void> {
    return this.billingService.deleteInvoice(id, tenantId);
  }

  @Post('payments')
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<Payment> {
    return this.billingService.createPayment(createPaymentDto, user.id, tenantId);
  }

  @Get('payments')
  @ApiOperation({ summary: 'Get all payments with optional filtering' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  async findAllPayments(@Query() filters: any, @CurrentTenant() tenantId: string): Promise<Payment[]> {
    return this.billingService.findAllPayments(tenantId, filters);
  }

  @Get('payments/:id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async findPaymentById(@Param('id') id: string, @CurrentTenant() tenantId: string): Promise<Payment> {
    return this.billingService.findPaymentById(id, tenantId);
  }
}
