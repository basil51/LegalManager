
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { Tenant } from './modules/tenants/tenant.entity';
import { User } from './modules/users/user.entity';
import { Role } from './modules/auth/role.entity';
import { UserRole } from './modules/auth/user-role.entity';
import { Client } from './modules/clients/client.entity';
import { Court } from './modules/courts/court.entity';
import { Case } from './modules/cases/case.entity';
import { Session } from './modules/sessions/session.entity';
import { Document } from './modules/documents/document.entity';
import { Appointment } from './modules/appointments/appointment.entity';
import { Reminder } from './modules/appointments/reminder.entity';
import { Message } from './modules/messages/message.entity';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { ClientsModule } from './modules/clients/clients.module';
import { CourtsModule } from './modules/courts/courts.module';
import { CasesModule } from './modules/cases/cases.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { MessagesModule } from './modules/messages/messages.module';
import { UsersModule } from './modules/users/users.module';

function parseDatabaseUrl(url?: string): Partial<DataSourceOptions> {
  if (!url) return {};
  return { type: 'postgres', url } as Partial<DataSourceOptions>;
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        ...parseDatabaseUrl(process.env.DATABASE_URL),
        autoLoadEntities: true,
        synchronize: false,
        ssl: false
      })
    }),
    TypeOrmModule.forFeature([Tenant, User, Role, UserRole, Client, Court, Case, Session, Document, Appointment, Reminder, Message]),
    HealthModule,
    AuthModule,
    TenantsModule,
    ClientsModule,
    CourtsModule,
    CasesModule,
    SessionsModule,
    DocumentsModule,
    AppointmentsModule,
    MessagesModule,
    UsersModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
