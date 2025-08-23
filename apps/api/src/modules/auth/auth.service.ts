import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';
import { Tenant } from '../tenants/tenant.entity';
import { Role } from './role.entity';
import { UserRole } from './user-role.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['tenant', 'userRoles', 'userRoles.role'],
    });

    if (user && await bcrypt.compare(password, user.password_hash)) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenant.id,
      roles: user.userRoles.map((ur: any) => ur.role.name),
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        tenant: user.tenant,
        roles: user.userRoles.map((ur: any) => ur.role.name),
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Create or find tenant
    let tenant = await this.tenantRepository.findOne({
      where: { name: registerDto.tenant_name },
    });

    if (!tenant) {
      tenant = this.tenantRepository.create({
        name: registerDto.tenant_name,
      });
      await this.tenantRepository.save(tenant);
    }

    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(registerDto.password, saltRounds);

    // Create user
    const user = this.userRepository.create({
      email: registerDto.email,
      password_hash,
      display_name: registerDto.display_name || registerDto.email.split('@')[0],
      tenant,
    });

    await this.userRepository.save(user);

    // Assign default role (admin for first user in tenant)
    const adminRole = await this.roleRepository.findOne({
      where: { name: 'admin' },
    });

    if (adminRole) {
      const userRole = this.userRoleRepository.create({
        user,
        role: adminRole,
      });
      await this.userRoleRepository.save(userRole);
    }

    // Return user without password
    const { password_hash: _, ...result } = user;
    return result;
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['tenant', 'userRoles', 'userRoles.role'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { password_hash, ...result } = user;
    return {
      ...result,
      roles: user.userRoles.map((ur: any) => ur.role.name),
    };
  }
}
