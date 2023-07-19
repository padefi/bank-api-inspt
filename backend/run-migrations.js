import migrateMongo from 'migrate-mongo';
import path from 'path';
import config from './migrate-mongo-config.js';

const runMigrations = async () => {
  try {
    await migrateMongo.up(config, path.resolve('./migrations'));
    console.log('Migrationes ejecutadas correctamente.');
  } catch (error) {
    console.error('Error al ejecutar las migraciones:', error);
  }
}

export default runMigrations;