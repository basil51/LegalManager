import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../tenants/tenant-context.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@CurrentTenant() tenantId: string): Promise<Partial<User>[]> {
    return this.usersService.findAll(tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentTenant() tenantId: string): Promise<Partial<User> | null> {
    return this.usersService.findOne(id, tenantId);
  }
}
