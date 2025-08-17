// eslint-disable-next-line no-undef
import 'dotenv/config';

const common = {
  dialect: 'postgres',
  logging: false,
};

export default {
  development: {
    ...common,
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  test: {
    ...common,
    url: process.env.DATABASE_URL
  },
  production: {
    ...common,
    url: process.env.DATABASE_URL
  }
};
