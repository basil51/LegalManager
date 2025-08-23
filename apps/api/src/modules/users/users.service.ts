import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(tenantId: string): Promise<Partial<User>[]> {
    const users = await this.usersRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.email', 'user.display_name'])
      .where('user.tenant.id = :tenantId', { tenantId })
      .getMany();
    return users;
  }

  async findOne(id: string, tenantId: string): Promise<Partial<User> | null> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.email', 'user.display_name'])
      .where('user.id = :id AND user.tenant.id = :tenantId', { id, tenantId })
      .getOne();
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['tenant', 'userRoles', 'userRoles.role']
    });
  }
}
