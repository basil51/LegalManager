import { DataSource } from 'typeorm';
import { seedRoles } from './roles.seed';
import { seedUsers } from './users.seed';

async function runSeeds() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'legal',
    entities: ['src/**/*.entity.ts'],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('Database connected successfully');

    // Run seeds
    await seedRoles(dataSource);
    await seedUsers(dataSource);

    console.log('All seeds completed successfully');
  } catch (error) {
    console.error('Error running seeds:', error);
  } finally {
    await dataSource.destroy();
  }
}

runSeeds();
