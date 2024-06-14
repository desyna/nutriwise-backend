import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();
import user from './model/user_model.js';
import db from './utils/connect_db.js';
import router from './routes/user_routes.js';
import dotenv from 'dotenv';
dotenv.config();

const startServer = async () => {
  try {
    await db.authenticate();
    console.log('Database connected');

    // Generate tabel if not exists
    await user.sync();

    // Gunakan middleware sebelum router
    // app.use(
    //   cors({
    //     credentials: true,
    //     origin: ['http://localhost:3000/', 'https://nutriwise-mxpxa5hpeq-et.a.run.app/'],
    //   })
    // );
    app.use(cors());
    app.use(express.json());
    app.use(cookieParser()); // cookieParser diletakkan sebelum router
    app.use(router);

    // Middleware penanganan kesalahan umum
    app.use((err, req, res, next) => {
      console.error(err.stack.toString());
      res.status(500).send('Something broke what!');
    });

    // Jalankan server
    // const server = 
    app.listen(3000, () => console.log('Server running on port 3000'));
    // server.timeout(5000);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();
