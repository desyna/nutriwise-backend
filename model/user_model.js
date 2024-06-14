import { Sequelize } from 'sequelize';
import db from '../utils/connect_db.js';

const User = db.define(
  'users',
  {
    name: {
      type: Sequelize.STRING,
    },
    username: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    password: {
      type: Sequelize.STRING,
    },
    age: {
      type: Sequelize.INTEGER,
    },
    gender: {
      type: Sequelize.STRING,
    },
    height: {
      type: Sequelize.INTEGER,
    },
    weight: {
      type: Sequelize.INTEGER,
    },
    activity: {
      type: Sequelize.STRING,
    },
    refresh_token: {
      type: Sequelize.TEXT,
    },
  },
  {
    freezeTableName: true,
  }
);

export default User;
