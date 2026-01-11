const { DataSource } = require('typeorm');
const path = require('path');

// Parse DATABASE_URL - use environment variable directly
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Parse postgresql:// URL
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
  migrations: [path.join(__dirname, 'dist/migrations/*.js')],
  synchronize: false,
  logging: true,
});

async function runMigrations() {
  try {
    await dataSource.initialize();
    console.log('Database connected successfully');
    
    console.log('Running migrations...');
    const migrations = await dataSource.runMigrations();
    console.log(`✅ ${migrations.length} migrations executed`);
    
    await dataSource.destroy();
    return true;
  } catch (error) {
    console.error('Error running migrations:', error.message);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    return false;
  }
}

runMigrations().then(success => {
  process.exit(success ? 0 : 1);
});
