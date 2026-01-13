const { DataSource } = require('typeorm');
const bcrypt = require('bcrypt');
const path = require('path');

// Parse DATABASE_URL
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const urlMatch = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
if (!urlMatch) {
  console.error('Invalid DATABASE_URL format');
  process.exit(1);
}

const [, username, password, host, port, database] = urlMatch;

const dataSource = new DataSource({
  type: 'postgres',
  host: host,
  port: parseInt(port),
  username: username,
  password: password,
  database: database,
  entities: [path.join(__dirname, 'dist/**/*.entity.js')],
  synchronize: false,
  logging: false,
});

async function seed() {
  try {
    await dataSource.initialize();
    console.log('Database connected successfully');

    // Import entities
    const Role = (await import(path.join(__dirname, 'dist/modules/auth/role.entity.js'))).Role;
    const User = (await import(path.join(__dirname, 'dist/modules/users/user.entity.js'))).User;
    const Tenant = (await import(path.join(__dirname, 'dist/modules/tenants/tenant.entity.js'))).Tenant;
    const UserRole = (await import(path.join(__dirname, 'dist/modules/auth/user-role.entity.js'))).UserRole;

    const roleRepository = dataSource.getRepository(Role);
    const userRepository = dataSource.getRepository(User);
    const tenantRepository = dataSource.getRepository(Tenant);
    const userRoleRepository = dataSource.getRepository(UserRole);

    // Seed roles
    console.log('Seeding roles...');
    const defaultRoles = ['admin', 'lawyer', 'assistant', 'client'];
    const roles = {};
    for (const roleName of defaultRoles) {
      let role = await roleRepository.findOne({ where: { name: roleName } });
      if (!role) {
        role = roleRepository.create({ name: roleName });
        await roleRepository.save(role);
        console.log(`  ✓ Created role: ${roleName}`);
      } else {
        console.log(`  - Role already exists: ${roleName}`);
      }
      roles[roleName] = role;
    }

    // Seed tenant
    console.log('Seeding tenant...');
    let tenant = await tenantRepository.findOne({ where: { name: 'Legal Firm' } });
    if (!tenant) {
      tenant = tenantRepository.create({ name: 'Legal Firm' });
      await tenantRepository.save(tenant);
      console.log('  ✓ Created tenant: Legal Firm');
    } else {
      console.log('  - Tenant already exists: Legal Firm');
    }

    // Seed users
    console.log('Seeding users...');
    const testUsers = [
      {
        email: 'admin@legalfirm.com',
        password: 'password123',
        display_name: 'Admin User',
        role: roles.admin
      },
      {
        email: 'lawyer1@legalfirm.com',
        password: 'password123',
        display_name: 'John Smith',
        role: roles.lawyer
      }
    ];

    for (const userData of testUsers) {
      let user = await userRepository.findOne({ 
        where: { email: userData.email } 
      });
      
      if (!user) {
        const passwordHash = await bcrypt.hash(userData.password, 10);
        user = userRepository.create({
          email: userData.email,
          password_hash: passwordHash,
          display_name: userData.display_name,
          tenant: tenant
        });
        await userRepository.save(user);
        console.log(`  ✓ Created user: ${userData.email}`);

        // Assign role - check if already assigned
        const existingUserRole = await userRoleRepository.findOne({
          where: { user: { id: user.id }, role: { id: userData.role.id } }
        });
        
        if (!existingUserRole) {
          const userRole = userRoleRepository.create({
            user: user,
            role: userData.role
          });
          await userRoleRepository.save(userRole);
          console.log(`    ✓ Assigned role: ${userData.role.name}`);
        } else {
          console.log(`    - Role already assigned: ${userData.role.name}`);
        }
      } else {
        console.log(`  - User already exists: ${userData.email}`);
        // Check if user has the role assigned
        const existingUserRole = await userRoleRepository.findOne({
          where: { user: { id: user.id }, role: { id: userData.role.id } }
        });
        
        if (!existingUserRole) {
          const userRole = userRoleRepository.create({
            user: user,
            role: userData.role
          });
          await userRoleRepository.save(userRole);
          console.log(`    ✓ Assigned role: ${userData.role.name}`);
        }
      }
    }

    console.log('\n✅ Seeding completed successfully!');
    await dataSource.destroy();
  } catch (error) {
    console.error('Error seeding database:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

seed();
