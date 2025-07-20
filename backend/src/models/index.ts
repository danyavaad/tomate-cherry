import { Sequelize } from 'sequelize-typescript';
import { User } from './User';
import { Property } from '../models/Property';
import 'dotenv/config';

console.log('DB config:', {
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
});

const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  dialect: 'postgres',
  models: [__dirname + '/models'],
});

sequelize.addModels([User, Property]);

export { sequelize, User, Property };
