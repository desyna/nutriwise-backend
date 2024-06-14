import { Sequelize } from 'sequelize';
import db from '../utils/connect_db';

const History = db.define(
  'history',
  {
    label: {
      type: Sequelize.STRING,
    },
    date: {
      type: Sequelize.DATE,
    },
    total_cal: {
      type: Sequelize.INTEGER,
    },
  },
  {
    freezeTableName: true,
  }
);

export default History;
