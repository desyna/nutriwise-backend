import express from 'express';
const router = express.Router();

// const user = require('../model/user_model');

import { verifyToken, refreshToken } from '../middleware/token.js';

import {
  getUsers,
  // loginHandler,
  login,
  register,
  updateUser,
  // initialEnpoint,
  // logout
} from '../controller/users.js';

router.get('/users', verifyToken, getUsers);
router.get('/tes', getUsers);
// router.get('/', initialEnpoint);

router.post('/register', register);
router.post('/login', login);
router.post('/token', refreshToken);

router.put('/update/:username', updateUser);

// router.delete('/token', logout);

export default router;
