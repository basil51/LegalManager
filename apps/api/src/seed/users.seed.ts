import { DataSource } from 'typeorm';
import { User } from '../modules/users/user.entity';
import { Tenant } from '../modules/tenants/tenant.entity';
import { Role } from '../modules/auth/role.entity';
import { UserRole } from '../modules/auth/user-role.entity';
import * as bcrypt from 'bcrypt';

export async function seedUsers(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const tenantRepository = dataSource.getRepository(Tenant);
  const roleRepository = dataSource.getRepository(Role);
  const userRoleRepository = dataSource.getRepository(UserRole);

  // Create or find tenant
  let tenant = await tenantRepository.findOne({
    where: { name: 'Legal Firm' }
  });

  if (!tenant) {
    tenant = tenantRepository.create({
      name: 'Legal Firm'
    });
    await tenantRepository.save(tenant);
    console.log('Created tenant: Legal Firm');
  } else {
    console.log('Tenant already exists: Legal Firm');
  }

  // Get roles
  const adminRole = await roleRepository.findOne({ where: { name: 'admin' } });
  const lawyerRole = await roleRepository.findOne({ where: { name: 'lawyer' } });

  if (!adminRole || !lawyerRole) {
    console.error('Required roles not found');
    return;
  }

  // Create test users
  const testUsers = [
    {
      email: 'admin@legalfirm.com',
      password: 'password123',
      display_name: 'Admin User',
      role: adminRole
    },
    {
      email: 'lawyer1@legalfirm.com',
      password: 'password123',
      display_name: 'John Smith',
      role: lawyerRole
    },
    {
      email: 'lawyer2@legalfirm.com',
      password: 'password123',
      display_name: 'Jane Doe',
      role: lawyerRole
    }
  ];

  for (const userData of testUsers) {
    const existingUser = await userRepository.findOne({
      where: { email: userData.email }
    });

    if (!existingUser) {
      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, 10);

      // Create user
      const user = userRepository.create({
        email: userData.email,
        password_hash: passwordHash,
        display_name: userData.display_name,
        tenant: tenant
      });
      await userRepository.save(user);

      // Create user role
      const userRole = userRoleRepository.create({
        user: user,
        role: userData.role
      });
      await userRoleRepository.save(userRole);

      console.log(`Created user: ${userData.email} with role: ${userData.role.name}`);
    } else {
      console.log(`User already exists: ${userData.email}`);
    }
  }
}
