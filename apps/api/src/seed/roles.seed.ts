import { DataSource } from 'typeorm';
import { Role } from '../modules/auth/role.entity';

export async function seedRoles(dataSource: DataSource) {
  const roleRepository = dataSource.getRepository(Role);

  const defaultRoles = [
    { name: 'admin' },
    { name: 'lawyer' },
    { name: 'assistant' },
    { name: 'client' },
  ];

  for (const roleData of defaultRoles) {
    const existingRole = await roleRepository.findOne({
      where: { name: roleData.name },
    });

    if (!existingRole) {
      const role = roleRepository.create(roleData);
      await roleRepository.save(role);
      console.log(`Created role: ${roleData.name}`);
    } else {
      console.log(`Role already exists: ${roleData.name}`);
    }
  }
}
