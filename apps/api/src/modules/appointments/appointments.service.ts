import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Appointment, AppointmentType, AppointmentStatus } from './appointment.entity';
import { Reminder, ReminderStatus } from './reminder.entity';
import { TenantContextService } from '../tenants/tenant-context.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
    @InjectRepository(Reminder)
    private remindersRepository: Repository<Reminder>,
    private tenantContextService: TenantContextService,
  ) {}

  async create(createAppointmentDto: any, tenantId: string): Promise<Appointment> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      // Convert date string to Date object and handle relationships
      const processedDto = {
        ...createAppointmentDto,
        scheduled_at: new Date(createAppointmentDto.scheduled_at),
        tenant: { id: tenantId },
        lawyer: { id: createAppointmentDto.lawyerId },
        client: createAppointmentDto.clientId ? { id: createAppointmentDto.clientId } : null,
        case: createAppointmentDto.caseId ? { id: createAppointmentDto.caseId } : null,
      };
      
      const appointment = this.appointmentsRepository.create(processedDto);
      const savedAppointment = await this.appointmentsRepository.save(appointment);
      
      // Create default reminder (15 minutes before)
      await this.createDefaultReminder(savedAppointment, tenantId);
      
      return savedAppointment;
    });
  }

  async findAll(tenantId: string): Promise<Appointment[]> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      return this.appointmentsRepository.find({
        where: { is_active: true },
        relations: ['tenant', 'lawyer', 'client', 'case'],
        order: { scheduled_at: 'ASC' },
      });
    });
  }

  async findOne(id: string, tenantId: string): Promise<Appointment | null> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      return this.appointmentsRepository.findOne({
        where: { id, is_active: true },
        relations: ['tenant', 'lawyer', 'client', 'case'],
      });
    });
  }

  async findByLawyer(lawyerId: string, tenantId: string): Promise<Appointment[]> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      return this.appointmentsRepository.find({
        where: { lawyer: { id: lawyerId }, is_active: true },
        relations: ['tenant', 'lawyer', 'client', 'case'],
        order: { scheduled_at: 'ASC' },
      });
    });
  }

  async findByClient(clientId: string, tenantId: string): Promise<Appointment[]> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      return this.appointmentsRepository.find({
        where: { client: { id: clientId }, is_active: true },
        relations: ['tenant', 'lawyer', 'client', 'case'],
        order: { scheduled_at: 'ASC' },
      });
    });
  }

  async findByStatus(status: AppointmentStatus, tenantId: string): Promise<Appointment[]> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      return this.appointmentsRepository.find({
        where: { status, is_active: true },
        relations: ['tenant', 'lawyer', 'client', 'case'],
        order: { scheduled_at: 'ASC' },
      });
    });
  }

  async findUpcoming(tenantId: string, days: number = 7): Promise<Appointment[]> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + days);

      return this.appointmentsRepository.find({
        where: {
          scheduled_at: Between(now, futureDate),
          is_active: true,
        },
        relations: ['tenant', 'lawyer', 'client', 'case'],
        order: { scheduled_at: 'ASC' },
      });
    });
  }

  async findToday(tenantId: string): Promise<Appointment[]> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      return this.appointmentsRepository.find({
        where: {
          scheduled_at: Between(startOfDay, endOfDay),
          is_active: true,
        },
        relations: ['tenant', 'lawyer', 'client', 'case'],
        order: { scheduled_at: 'ASC' },
      });
    });
  }

  async update(id: string, updateAppointmentDto: Partial<Appointment>, tenantId: string): Promise<Appointment | null> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      await this.appointmentsRepository.update(id, updateAppointmentDto);
      return this.findOne(id, tenantId);
    });
  }

  async remove(id: string, tenantId: string): Promise<void> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      // Cancel all reminders for this appointment
      await this.remindersRepository.update(
        { appointment: { id }, is_active: true },
        { status: ReminderStatus.CANCELLED, is_active: false }
      );
      
      // Soft delete the appointment
      await this.appointmentsRepository.update(id, { is_active: false });
    });
  }

  // Reminder methods
  async createReminder(
    appointmentId: string,
    recipientId: string,
    type: string,
    minutesBefore: number,
    tenantId: string
  ): Promise<Reminder> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      const appointment = await this.findOne(appointmentId, tenantId);
      if (!appointment) {
        throw new Error('Appointment not found');
      }

      const reminderTime = new Date(appointment.scheduled_at);
      reminderTime.setMinutes(reminderTime.getMinutes() - minutesBefore);

      const reminder = this.remindersRepository.create({
        tenant: { id: tenantId },
        appointment: { id: appointmentId },
        recipient: { id: recipientId },
        type: type as any,
        scheduled_at: reminderTime,
        minutes_before: minutesBefore,
      });

      return this.remindersRepository.save(reminder);
    });
  }

  private async createDefaultReminder(appointment: Appointment, tenantId: string): Promise<void> {
    try {
      await this.createReminder(
        appointment.id,
        appointment.lawyer.id,
        'email',
        15,
        tenantId 
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create default reminder: ${errorMessage}`);
    }
  }

  // Cron job to process reminders
  @Cron(CronExpression.EVERY_MINUTE)
  async processReminders() {
    this.logger.log('Processing reminders...');
    
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    const pendingReminders = await this.remindersRepository.find({
      where: {
        status: ReminderStatus.PENDING,
        scheduled_at: Between(now, fiveMinutesFromNow),
        is_active: true,
      },
      relations: ['appointment', 'recipient', 'tenant'],
    });

    for (const reminder of pendingReminders) {
      try {
        await this.sendReminder(reminder);
        await this.remindersRepository.update(reminder.id, {
          status: ReminderStatus.SENT,
          sent_at: new Date(),
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Failed to send reminder ${reminder.id}: ${errorMessage}`);
        await this.remindersRepository.update(reminder.id, {
          status: ReminderStatus.FAILED,
          error_message: errorMessage,
        });
      }
    }
  }

  private async sendReminder(reminder: Reminder): Promise<void> {
    // This is a placeholder for actual reminder sending logic
    // In a real implementation, you would integrate with email/SMS services
    this.logger.log(`Sending ${reminder.type} reminder to ${reminder.recipient.email} for appointment: ${reminder.appointment.title}`);
    
    // Simulate sending delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
