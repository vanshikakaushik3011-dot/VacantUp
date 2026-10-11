import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'vacantup_super_secret_jwt_key_2026_healthcare_jwt',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/vacantup?schema=public',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};
