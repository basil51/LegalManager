
import { Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { User } from '../users/user.entity';
import { Role } from './role.entity';

@Entity({ name: 'user_roles' })
@Unique(['user', 'role'])
export class UserRole {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (u) => u.userRoles, { eager: true })
  user!: User;

  @ManyToOne(() => Role, { eager: true })
  role!: Role;
}
