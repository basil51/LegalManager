import { DataSource } from 'typeorm';
import { User } from '../modules/users/user.entity';
import { Tenant } from '../modules/tenants/tenant.entity';
import { Role } from '../modules/auth/role.entity';
import { UserRole } from '../modules/auth/user-role.entity';
import { Client } from '../modules/clients/client.entity';
import { Court } from '../modules/courts/court.entity';
import { Case, CaseStatus, CaseType } from '../modules/cases/case.entity';
import { Appointment } from '../modules/appointments/appointment.entity';
import { Document } from '../modules/documents/document.entity';
import { Invoice } from '../modules/billing/invoice.entity';
import { InvoiceItem } from '../modules/billing/invoice-item.entity';
import { Payment } from '../modules/billing/payment.entity';
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

  console.log('✅ Comprehensive test data seeding completed successfully!');
  console.log(`Created ${createdCourts.length} courts`);
  console.log(`Created ${createdClients.length} clients`);
  console.log(`Created ${createdCases.length} cases`);
}
