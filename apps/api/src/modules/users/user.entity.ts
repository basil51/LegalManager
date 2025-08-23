
import { Column, CreateDateColumn, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { UserRole } from '../auth/user-role.entity';

@Entity({ name: 'users' })
@Index(['email', 'tenant'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Tenant, { nullable: false, eager: true })
  tenant!: Tenant;

  @Column({ type: 'text' })
  email!: string;

  @Column({ type: 'text' })
  password_hash!: string;

  @Column({ type: 'text', nullable: true })
  display_name!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @OneToMany(() => UserRole, (ur) => ur.user)
  userRoles!: UserRole[];
}
