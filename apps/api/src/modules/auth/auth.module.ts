import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../users/user.entity';
import { Tenant } from '../tenants/tenant.entity';
import { Role } from './role.entity';
import { UserRole } from './user-role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Tenant, Role, UserRole]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const jwtSecret = configService.get<string>('JWT_SECRET');
        if (!jwtSecret || jwtSecret === 'change-me') {
          throw new Error('JWT_SECRET must be set in environment variables. Do not use default values in production!');
        }
        return {
          secret: jwtSecret,
          signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN', '24h') },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
