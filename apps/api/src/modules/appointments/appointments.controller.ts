import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../tenants/tenant-context.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { AppointmentType, AppointmentStatus } from './appointment.entity';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  create(@Body() createAppointmentDto: CreateAppointmentDto, @CurrentTenant() tenantId: string) {
    return this.appointmentsService.create(createAppointmentDto, tenantId);
  }

  @Get()
  findAll(@CurrentTenant() tenantId: string) {
    return this.appointmentsService.findAll(tenantId);
  }

  @Get('today')
  findToday(@CurrentTenant() tenantId: string) {
    return this.appointmentsService.findToday(tenantId);
  }

  @Get('upcoming')
  findUpcoming(
    @CurrentTenant() tenantId: string,
    @Query('days') days?: string
  ) {
    const daysNumber = days ? parseInt(days) : 7;
    return this.appointmentsService.findUpcoming(tenantId, daysNumber);
  }

  @Get('lawyer/:lawyerId')
  findByLawyer(@Param('lawyerId') lawyerId: string, @CurrentTenant() tenantId: string) {
    return this.appointmentsService.findByLawyer(lawyerId, tenantId);
  }

  @Get('client/:clientId')
  findByClient(@Param('clientId') clientId: string, @CurrentTenant() tenantId: string) {
    return this.appointmentsService.findByClient(clientId, tenantId);
  }

  @Get('status/:status')
  findByStatus(@Param('status') status: AppointmentStatus, @CurrentTenant() tenantId: string) {
    return this.appointmentsService.findByStatus(status, tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.appointmentsService.findOne(id, tenantId);
  }

  @Post(':id/reminders')
  createReminder(
    @Param('id') appointmentId: string,
    @Body() reminderData: {
      recipientId: string;
      type: string;
      minutesBefore: number;
    },
    @CurrentTenant() tenantId: string
  ) {
    return this.appointmentsService.createReminder(
      appointmentId,
      reminderData.recipientId,
      reminderData.type,
      reminderData.minutesBefore,
      tenantId
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @CurrentTenant() tenantId: string
  ) {
    return this.appointmentsService.update(id, updateAppointmentDto, tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.appointmentsService.remove(id, tenantId);
  }
}
