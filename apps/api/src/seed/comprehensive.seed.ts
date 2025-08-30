import { DataSource } from 'typeorm';
import { User } from '../modules/users/user.entity';
import { Tenant } from '../modules/tenants/tenant.entity';
import { Role } from '../modules/auth/role.entity';
import { UserRole } from '../modules/auth/user-role.entity';
import { Client } from '../modules/clients/client.entity';
import { Court } from '../modules/courts/court.entity';
import { Case, CaseStatus, CaseType } from '../modules/cases/case.entity';
import { Appointment, AppointmentType, AppointmentStatus } from '../modules/appointments/appointment.entity';
import { Document, DocumentType } from '../modules/documents/document.entity';
import { Invoice, InvoiceStatus, PaymentMethod } from '../modules/billing/invoice.entity';
import { InvoiceItem, ItemType } from '../modules/billing/invoice-item.entity';
import { Payment, PaymentStatus } from '../modules/billing/payment.entity';
import * as bcrypt from 'bcrypt';

export async function seedComprehensiveData(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const tenantRepository = dataSource.getRepository(Tenant);
  const roleRepository = dataSource.getRepository(Role);
  const userRoleRepository = dataSource.getRepository(UserRole);
  const clientRepository = dataSource.getRepository(Client);
  const courtRepository = dataSource.getRepository(Court);
  const caseRepository = dataSource.getRepository(Case);
  const appointmentRepository = dataSource.getRepository(Appointment);
  const documentRepository = dataSource.getRepository(Document);
  const invoiceRepository = dataSource.getRepository(Invoice);
  const invoiceItemRepository = dataSource.getRepository(InvoiceItem);
  const paymentRepository = dataSource.getRepository(Payment);

  // Get or create tenant
  let tenant = await tenantRepository.findOne({
    where: { name: 'Legal Firm' }
  });

  if (!tenant) {
    tenant = tenantRepository.create({
      name: 'Legal Firm'
    });
    await tenantRepository.save(tenant);
    console.log('Created tenant: Legal Firm');
  }

  // Get roles
  const adminRole = await roleRepository.findOne({ where: { name: 'admin' } });
  const lawyerRole = await roleRepository.findOne({ where: { name: 'lawyer' } });

  // Get users
  const adminUser = await userRepository.findOne({ where: { email: 'admin@legalfirm.com' } });
  const lawyer1 = await userRepository.findOne({ where: { email: 'lawyer1@legalfirm.com' } });
  const lawyer2 = await userRepository.findOne({ where: { email: 'lawyer2@legalfirm.com' } });

  if (!lawyer1 || !lawyer2) {
    console.error('Required users not found. Please run basic seed first.');
    return;
  }

  // Create courts
  const courts = [
    {
      name: 'Central District Court',
      address: '123 Main Street, Downtown',
      phone: '+1-555-0101',
      website: 'https://court.example.com',
      notes: 'Main district court'
    },
    {
      name: 'Family Court',
      address: '456 Family Ave, Suburb',
      phone: '+1-555-0102',
      website: 'https://familycourt.example.com',
      notes: 'Specialized family law court'
    },
    {
      name: 'Commercial Court',
      address: '789 Business Blvd, Financial District',
      phone: '+1-555-0103',
      website: 'https://commercialcourt.example.com',
      notes: 'Business and commercial disputes'
    }
  ];

  const createdCourts = [];
  for (const courtData of courts) {
    let court = await courtRepository.findOne({
      where: { name: courtData.name }
    });

    if (!court) {
      court = courtRepository.create({
        ...courtData,
        tenant: tenant
      });
      await courtRepository.save(court);
      console.log(`Created court: ${courtData.name}`);
    }
    createdCourts.push(court);
  }

  // Create clients
  const clients = [
    {
      email: 'john.doe@email.com',
      first_name: 'John',
      last_name: 'Doe',
      phone: '+1-555-1001',
      address: '123 Client Street, City',
      notes: 'Corporate client - technology company'
    },
    {
      email: 'jane.smith@email.com',
      first_name: 'Jane',
      last_name: 'Smith',
      phone: '+1-555-1002',
      address: '456 Client Ave, Suburb',
      notes: 'Individual client - family law case'
    },
    {
      email: 'bob.wilson@email.com',
      first_name: 'Bob',
      last_name: 'Wilson',
      phone: '+1-555-1003',
      address: '789 Client Blvd, Downtown',
      notes: 'Business client - contract dispute'
    },
    {
      email: 'sarah.johnson@email.com',
      first_name: 'Sarah',
      last_name: 'Johnson',
      phone: '+1-555-1004',
      address: '321 Client Lane, Village',
      notes: 'Individual client - estate planning'
    },
    {
      email: 'mike.brown@email.com',
      first_name: 'Mike',
      last_name: 'Brown',
      phone: '+1-555-1005',
      address: '654 Client Road, Town',
      notes: 'Corporate client - employment law'
    }
  ];

  const createdClients = [];
  for (const clientData of clients) {
    let client = await clientRepository.findOne({
      where: { email: clientData.email }
    });

    if (!client) {
      client = clientRepository.create({
        ...clientData,
        tenant: tenant
      });
      await clientRepository.save(client);
      console.log(`Created client: ${clientData.first_name} ${clientData.last_name}`);
    }
    createdClients.push(client);
  }

  // Create cases
  const cases = [
    {
      case_number: 'CASE-2024-001',
      title: 'Doe vs. TechCorp - Employment Dispute',
      description: 'Wrongful termination and discrimination case',
      status: CaseStatus.OPEN,
      type: CaseType.CIVIL,
      filing_date: new Date('2024-01-15'),
      hearing_date: new Date('2024-06-15'),
      notes: 'Complex employment law case with multiple witnesses',
      client: createdClients[0],
      court: createdCourts[0],
      assigned_lawyer: lawyer1
    },
    {
      case_number: 'CASE-2024-002',
      title: 'Smith Family - Divorce Proceedings',
      description: 'Divorce and child custody case',
      status: CaseStatus.PENDING,
      type: CaseType.FAMILY,
      filing_date: new Date('2024-02-20'),
      hearing_date: new Date('2024-05-10'),
      notes: 'Amicable divorce with shared custody agreement',
      client: createdClients[1],
      court: createdCourts[1],
      assigned_lawyer: lawyer2
    },
    {
      case_number: 'CASE-2024-003',
      title: 'Wilson Enterprises - Contract Breach',
      description: 'Breach of contract and damages claim',
      status: CaseStatus.OPEN,
      type: CaseType.CORPORATE,
      filing_date: new Date('2024-03-10'),
      hearing_date: new Date('2024-07-20'),
      notes: 'High-value commercial dispute',
      client: createdClients[2],
      court: createdCourts[2],
      assigned_lawyer: lawyer1
    },
    {
      case_number: 'CASE-2024-004',
      title: 'Johnson Estate - Will Contest',
      description: 'Estate planning and will validation',
      status: CaseStatus.CLOSED,
      type: CaseType.CIVIL,
      filing_date: new Date('2024-01-05'),
      hearing_date: new Date('2024-04-15'),
      notes: 'Successfully resolved estate dispute',
      client: createdClients[3],
      court: createdCourts[0],
      assigned_lawyer: lawyer2
    },
    {
      case_number: 'CASE-2024-005',
      title: 'Brown Industries - Labor Dispute',
      description: 'Collective bargaining and union negotiations',
      status: CaseStatus.ON_HOLD,
      type: CaseType.CORPORATE,
      filing_date: new Date('2024-04-01'),
      hearing_date: new Date('2024-08-30'),
      notes: 'Ongoing negotiations with labor union',
      client: createdClients[4],
      court: createdCourts[2],
      assigned_lawyer: lawyer1
    }
  ];

  const createdCases = [];
  for (const caseData of cases) {
    let case_ = await caseRepository.findOne({
      where: { case_number: caseData.case_number }
    });

    if (!case_) {
      case_ = caseRepository.create({
        ...caseData,
        tenant: tenant
      });
      await caseRepository.save(case_);
      console.log(`Created case: ${caseData.case_number} - ${caseData.title}`);
    }
    createdCases.push(case_);
  }

  // Create appointments
  const appointments = [
    {
      title: 'Initial Consultation - Doe Case',
      description: 'First meeting with John Doe to discuss employment case',
      type: AppointmentType.CONSULTATION,
      status: AppointmentStatus.CONFIRMED,
      scheduled_at: new Date('2024-06-20T10:00:00Z'),
      duration_minutes: 60,
      location: 'Office Conference Room A',
      notes: 'Bring employment contract and termination letter',
      lawyer: lawyer1,
      client: createdClients[0],
      case: createdCases[0]
    },
    {
      title: 'Court Hearing - Smith Divorce',
      description: 'Final hearing for divorce decree',
      type: AppointmentType.COURT_HEARING,
      status: AppointmentStatus.SCHEDULED,
      scheduled_at: new Date('2024-06-25T14:00:00Z'),
      duration_minutes: 120,
      location: 'Family Court - Courtroom 3',
      notes: 'Bring all financial documents and custody agreement',
      lawyer: lawyer2,
      client: createdClients[1],
      case: createdCases[1]
    },
    {
      title: 'Client Meeting - Wilson Contract',
      description: 'Review contract terms and discuss strategy',
      type: AppointmentType.CLIENT_MEETING,
      status: AppointmentStatus.CONFIRMED,
      scheduled_at: new Date('2024-06-22T15:30:00Z'),
      duration_minutes: 90,
      location: 'Office Meeting Room B',
      notes: 'Prepare contract analysis and damages calculation',
      lawyer: lawyer1,
      client: createdClients[2],
      case: createdCases[2]
    },
    {
      title: 'Document Review - Brown Labor Case',
      description: 'Review union contract and labor law compliance',
      type: AppointmentType.DOCUMENT_REVIEW,
      status: AppointmentStatus.SCHEDULED,
      scheduled_at: new Date('2024-06-24T09:00:00Z'),
      duration_minutes: 120,
      location: 'Office Library',
      notes: 'Focus on collective bargaining agreement terms',
      lawyer: lawyer1,
      client: createdClients[4],
      case: createdCases[4]
    },
    {
      title: 'Phone Consultation - Johnson Estate',
      description: 'Follow-up call regarding estate distribution',
      type: AppointmentType.PHONE_CALL,
      status: AppointmentStatus.CONFIRMED,
      scheduled_at: new Date('2024-06-23T11:00:00Z'),
      duration_minutes: 30,
      location: 'Phone',
      notes: 'Discuss final distribution plan',
      lawyer: lawyer2,
      client: createdClients[3],
      case: createdCases[3]
    },
    {
      title: 'Video Call - Doe Case Update',
      description: 'Weekly update call with John Doe',
      type: AppointmentType.VIDEO_CALL,
      status: AppointmentStatus.SCHEDULED,
      scheduled_at: new Date('2024-06-26T16:00:00Z'),
      duration_minutes: 45,
      location: 'Zoom Meeting',
      meeting_link: 'https://zoom.us/j/123456789',
      notes: 'Discuss case progress and next steps',
      lawyer: lawyer1,
      client: createdClients[0],
      case: createdCases[0]
    }
  ];

  for (const appointmentData of appointments) {
    const existingAppointment = await appointmentRepository.findOne({
      where: { title: appointmentData.title }
    });

    if (!existingAppointment) {
      const appointment = appointmentRepository.create({
        ...appointmentData,
        tenant: tenant
      });
      await appointmentRepository.save(appointment);
      console.log(`Created appointment: ${appointmentData.title}`);
    }
  }

  // Create documents
  const documents = [
    {
      filename: 'employment_contract.pdf',
      original_filename: 'employment_contract.pdf',
      mime_type: 'application/pdf',
      file_size: 245760,
      storage_path: '/documents/employment_contract.pdf',
      title: 'Employment Contract - TechCorp',
      description: 'Original employment agreement between John Doe and TechCorp',
      type: DocumentType.CONTRACT,
      tags: 'employment,contract,techcorp',
      case: createdCases[0],
      client: createdClients[0],
      uploaded_by: lawyer1
    },
    {
      filename: 'termination_letter.pdf',
      original_filename: 'termination_letter.pdf',
      mime_type: 'application/pdf',
      file_size: 51200,
      storage_path: '/documents/termination_letter.pdf',
      title: 'Termination Letter',
      description: 'Official termination letter from TechCorp',
      type: DocumentType.CORRESPONDENCE,
      tags: 'termination,employment,techcorp',
      case: createdCases[0],
      client: createdClients[0],
      uploaded_by: lawyer1
    },
    {
      filename: 'divorce_petition.pdf',
      original_filename: 'divorce_petition.pdf',
      mime_type: 'application/pdf',
      file_size: 102400,
      storage_path: '/documents/divorce_petition.pdf',
      title: 'Divorce Petition - Smith Family',
      description: 'Official divorce petition filed with family court',
      type: DocumentType.COURT_FILING,
      tags: 'divorce,family,court',
      case: createdCases[1],
      client: createdClients[1],
      uploaded_by: lawyer2
    },
    {
      filename: 'contract_breach_evidence.pdf',
      original_filename: 'contract_breach_evidence.pdf',
      mime_type: 'application/pdf',
      file_size: 153600,
      storage_path: '/documents/contract_breach_evidence.pdf',
      title: 'Contract Breach Evidence',
      description: 'Documentation of contract violations by Wilson Enterprises',
      type: DocumentType.EVIDENCE,
      tags: 'contract,breach,evidence',
      case: createdCases[2],
      client: createdClients[2],
      uploaded_by: lawyer1
    },
    {
      filename: 'will_document.pdf',
      original_filename: 'will_document.pdf',
      mime_type: 'application/pdf',
      file_size: 76800,
      storage_path: '/documents/will_document.pdf',
      title: 'Last Will and Testament',
      description: 'Original will document for Sarah Johnson estate',
      type: DocumentType.CONTRACT,
      tags: 'will,estate,planning',
      case: createdCases[3],
      client: createdClients[3],
      uploaded_by: lawyer2
    },
    {
      filename: 'labor_contract.pdf',
      original_filename: 'labor_contract.pdf',
      mime_type: 'application/pdf',
      file_size: 184320,
      storage_path: '/documents/labor_contract.pdf',
      title: 'Collective Bargaining Agreement',
      description: 'Union contract for Brown Industries employees',
      type: DocumentType.CONTRACT,
      tags: 'labor,union,contract',
      case: createdCases[4],
      client: createdClients[4],
      uploaded_by: lawyer1
    }
  ];

  for (const documentData of documents) {
    const existingDocument = await documentRepository.findOne({
      where: { title: documentData.title }
    });

    if (!existingDocument) {
      const document = documentRepository.create({
        ...documentData,
        tenant: tenant
      });
      await documentRepository.save(document);
      console.log(`Created document: ${documentData.title}`);
    }
  }

  // Create invoices
  const invoices = [
    {
      invoice_number: 'INV-2024-001',
      title: 'Legal Services - Doe Employment Case',
      description: 'Legal services for employment dispute case',
      status: InvoiceStatus.SENT,
      subtotal: 5000.00,
      tax_amount: 500.00,
      discount_amount: 0.00,
      total_amount: 5500.00,
      paid_amount: 2000.00,
      balance_due: 3500.00,
      issue_date: new Date('2024-05-01'),
      due_date: new Date('2024-06-01'),
      payment_method: PaymentMethod.BANK_TRANSFER,
      payment_reference: 'BT-2024-001',
      terms_and_conditions: 'Payment due within 30 days. Late payments subject to 1.5% monthly interest.',
      case: createdCases[0],
      client: createdClients[0],
      created_by: lawyer1
    },
    {
      invoice_number: 'INV-2024-002',
      title: 'Legal Services - Smith Divorce Case',
      description: 'Legal services for divorce proceedings',
      status: InvoiceStatus.PAID,
      subtotal: 3000.00,
      tax_amount: 300.00,
      discount_amount: 0.00,
      total_amount: 3300.00,
      paid_amount: 3300.00,
      balance_due: 0.00,
      issue_date: new Date('2024-04-15'),
      due_date: new Date('2024-05-15'),
      paid_date: new Date('2024-05-10'),
      payment_method: PaymentMethod.CREDIT_CARD,
      payment_reference: 'CC-2024-001',
      terms_and_conditions: 'Payment due within 30 days. Late payments subject to 1.5% monthly interest.',
      case: createdCases[1],
      client: createdClients[1],
      created_by: lawyer2
    },
    {
      invoice_number: 'INV-2024-003',
      title: 'Legal Services - Wilson Contract Case',
      description: 'Legal services for contract breach case',
      status: InvoiceStatus.DRAFT,
      subtotal: 7500.00,
      tax_amount: 750.00,
      discount_amount: 500.00,
      total_amount: 7750.00,
      paid_amount: 0.00,
      balance_due: 7750.00,
      issue_date: new Date('2024-06-01'),
      due_date: new Date('2024-07-01'),
      terms_and_conditions: 'Payment due within 30 days. Late payments subject to 1.5% monthly interest.',
      case: createdCases[2],
      client: createdClients[2],
      created_by: lawyer1
    },
    {
      invoice_number: 'INV-2024-004',
      title: 'Legal Services - Johnson Estate',
      description: 'Estate planning and will validation services',
      status: InvoiceStatus.PAID,
      subtotal: 2000.00,
      tax_amount: 200.00,
      discount_amount: 0.00,
      total_amount: 2200.00,
      paid_amount: 2200.00,
      balance_due: 0.00,
      issue_date: new Date('2024-03-01'),
      due_date: new Date('2024-04-01'),
      paid_date: new Date('2024-03-25'),
      payment_method: PaymentMethod.CHECK,
      payment_reference: 'CHK-2024-001',
      terms_and_conditions: 'Payment due within 30 days. Late payments subject to 1.5% monthly interest.',
      case: createdCases[3],
      client: createdClients[3],
      created_by: lawyer2
    },
    {
      invoice_number: 'INV-2024-005',
      title: 'Legal Services - Brown Labor Case',
      description: 'Labor law and union negotiation services',
      status: InvoiceStatus.OVERDUE,
      subtotal: 4000.00,
      tax_amount: 400.00,
      discount_amount: 0.00,
      total_amount: 4400.00,
      paid_amount: 1000.00,
      balance_due: 3400.00,
      issue_date: new Date('2024-04-01'),
      due_date: new Date('2024-05-01'),
      terms_and_conditions: 'Payment due within 30 days. Late payments subject to 1.5% monthly interest.',
      case: createdCases[4],
      client: createdClients[4],
      created_by: lawyer1
    }
  ];

  const createdInvoices = [];
  for (const invoiceData of invoices) {
    let invoice = await invoiceRepository.findOne({
      where: { invoice_number: invoiceData.invoice_number }
    });

    if (!invoice) {
      invoice = invoiceRepository.create({
        ...invoiceData,
        tenant: tenant
      });
      await invoiceRepository.save(invoice);
      console.log(`Created invoice: ${invoiceData.invoice_number} - ${invoiceData.title}`);
      createdInvoices.push(invoice);
    }
  }

  // Create invoice items
  const invoiceItems = [
    {
      description: 'Initial consultation and case review',
      type: ItemType.SERVICE,
      quantity: 2,
      unit_price: 250.00,
      total_amount: 500.00,
      notes: '2 hours of initial consultation',
      invoice: createdInvoices[0]
    },
    {
      description: 'Document preparation and filing',
      type: ItemType.SERVICE,
      quantity: 8,
      unit_price: 200.00,
      total_amount: 1600.00,
      notes: '8 hours of document preparation',
      invoice: createdInvoices[0]
    },
    {
      description: 'Court appearance and representation',
      type: ItemType.SERVICE,
      quantity: 12,
      unit_price: 300.00,
      total_amount: 3600.00,
      notes: '12 hours of court representation',
      invoice: createdInvoices[0]
    },
    {
      description: 'Divorce petition preparation',
      type: ItemType.SERVICE,
      quantity: 5,
      unit_price: 200.00,
      total_amount: 1000.00,
      notes: '5 hours of petition preparation',
      invoice: createdInvoices[1]
    },
    {
      description: 'Mediation sessions',
      type: ItemType.SERVICE,
      quantity: 8,
      unit_price: 250.00,
      total_amount: 2000.00,
      notes: '8 hours of mediation',
      invoice: createdInvoices[1]
    },
    {
      description: 'Contract analysis and review',
      type: ItemType.SERVICE,
      quantity: 10,
      unit_price: 300.00,
      total_amount: 3000.00,
      notes: '10 hours of contract analysis',
      invoice: createdInvoices[2]
    },
    {
      description: 'Legal research and case preparation',
      type: ItemType.SERVICE,
      quantity: 15,
      unit_price: 300.00,
      total_amount: 4500.00,
      notes: '15 hours of legal research',
      invoice: createdInvoices[2]
    },
    {
      description: 'Estate planning consultation',
      type: ItemType.SERVICE,
      quantity: 3,
      unit_price: 200.00,
      total_amount: 600.00,
      notes: '3 hours of estate planning',
      invoice: createdInvoices[3]
    },
    {
      description: 'Will preparation and validation',
      type: ItemType.SERVICE,
      quantity: 7,
      unit_price: 200.00,
      total_amount: 1400.00,
      notes: '7 hours of will preparation',
      invoice: createdInvoices[3]
    },
    {
      description: 'Labor law consultation',
      type: ItemType.SERVICE,
      quantity: 6,
      unit_price: 250.00,
      total_amount: 1500.00,
      notes: '6 hours of labor law consultation',
      invoice: createdInvoices[4]
    },
    {
      description: 'Union negotiation support',
      type: ItemType.SERVICE,
      quantity: 10,
      unit_price: 250.00,
      total_amount: 2500.00,
      notes: '10 hours of union negotiation support',
      invoice: createdInvoices[4]
    }
  ];

  for (const itemData of invoiceItems) {
    const existingItem = await invoiceItemRepository.findOne({
      where: { 
        description: itemData.description,
        invoice: { id: itemData.invoice.id }
      }
    });

    if (!existingItem) {
      const item = invoiceItemRepository.create({
        ...itemData,
        tenant: tenant
      });
      await invoiceItemRepository.save(item);
      console.log(`Created invoice item: ${itemData.description}`);
    }
  }

  // Create payments
  const payments = [
    {
      payment_number: 'PAY-2024-001',
      amount: 2000.00,
      status: PaymentStatus.COMPLETED,
      payment_method: 'bank_transfer',
      reference_number: 'BT-2024-001',
      payment_date: new Date('2024-05-15'),
      notes: 'Partial payment for employment case',
      invoice: createdInvoices[0],
      client: createdClients[0],
      processed_by: adminUser
    },
    {
      payment_number: 'PAY-2024-002',
      amount: 3300.00,
      status: PaymentStatus.COMPLETED,
      payment_method: 'credit_card',
      reference_number: 'CC-2024-001',
      payment_date: new Date('2024-05-10'),
      notes: 'Full payment for divorce case',
      invoice: createdInvoices[1],
      client: createdClients[1],
      processed_by: adminUser
    },
    {
      payment_number: 'PAY-2024-003',
      amount: 2200.00,
      status: PaymentStatus.COMPLETED,
      payment_method: 'check',
      reference_number: 'CHK-2024-001',
      payment_date: new Date('2024-03-25'),
      notes: 'Full payment for estate planning',
      invoice: createdInvoices[3],
      client: createdClients[3],
      processed_by: adminUser
    },
    {
      payment_number: 'PAY-2024-004',
      amount: 1000.00,
      status: PaymentStatus.COMPLETED,
      payment_method: 'cash',
      reference_number: 'CASH-2024-001',
      payment_date: new Date('2024-04-15'),
      notes: 'Partial payment for labor case',
      invoice: createdInvoices[4],
      client: createdClients[4],
      processed_by: adminUser
    }
  ];

  for (const paymentData of payments) {
    const existingPayment = await paymentRepository.findOne({
      where: { payment_number: paymentData.payment_number }
    });

    if (!existingPayment) {
      const payment = paymentRepository.create({
        ...paymentData,
        tenant: tenant
      });
      await paymentRepository.save(payment);
      console.log(`Created payment: ${paymentData.payment_number} - $${paymentData.amount}`);
    }
  }

  console.log('✅ Comprehensive test data seeding completed successfully!');
  console.log(`Created ${createdCourts.length} courts`);
  console.log(`Created ${createdClients.length} clients`);
  console.log(`Created ${createdCases.length} cases`);
  console.log(`Created ${appointments.length} appointments`);
  console.log(`Created ${documents.length} documents`);
  console.log(`Created ${createdInvoices.length} invoices`);
  console.log(`Created ${invoiceItems.length} invoice items`);
  console.log(`Created ${payments.length} payments`);
}
