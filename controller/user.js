import express, { Router } from 'express';
import { findAll, findByPk, findOne, create, update } from '../model/user_model';
import { genSalt, hash, compare } from 'bcrypt';
const router = Router();
const app = express();

const initialEnpoint = async (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Connected to NutriWise-Backend!!',
  });
};

//get all user data
const getUsers = async (req, res) => {
  try {
    const user = await findAll({
      attributes: ['id', 'username', 'password'],
    });
    res.status(200).json({
      status: 'success',
      message: 'Sucessfully fetch all data user',
      users: user,
    });
  } catch (error) {
    console.log(`error : ${error.message}`);
  }
};

//get user data by username
const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await findByPk(username);

    if (!user) {
      return res.status(400).json({
        status: 'Error',
        message: `User with username ${username} does not exist!`,
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Successful fetch data user',
      user: user,
    });
  } catch (error) {
    console.log(`Error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

const loginHandler = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(`password : ${password}`);
    const user = await findOne({
      where: {
        username: username,
        // password: password,
      },
    });

    if (user) {
      // const decryptPasswordUser = await bcrypt.compare(password, users.password);
      // console.log(`password : ${decryptPasswordUser}`);

      if (password == user.password) {
        res.status(200).json({
          status: 'success',
          message: 'Login User Success!',
          user,
        });
      } else {
        res.status(400).json({
          status: 'failed',
          message: 'Wrong email or password!',
        });
      }
    } else {
      res.status(400).json({
        status: 'test',
        message: 'Wrong email or password!',
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message,
    });
  }
};

const register = async (req, res) => {
  const { username, name, password, tb, bb, usia, gender, activity, configPassword } = req.body;
  if (password !== configPassword) return res.status(400).json({ msg: 'Passwords do not match' });
  const salt = await genSalt();
  const hashPassword = await hash(password, salt);
  try {
    await create({
      username: username,
      name: name,
      password: hashPassword,
      tb: tb,
      bb: bb,
      usia: usia,
      gender: gender,
      activity: activity,
    });
    res.json({ msg: 'User registered successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken; // Menggunakan req.cookies
  if (!refreshToken) return res.sendStatus(204);
  const user = await findAll({
    where: {
      refresh_token: refreshToken,
    },
  });
  if (!user[0]) return res.sendStatus(204);
  const userId = user[0].id;
  await update(
    {
      refresh_token: null,
    },
    {
      where: {
        id: userId,
      },
    }
  );
  res.clearCookie('refreshToken');
  return res.sendStatus(200);
};

const Login = async (req, res) => {
  try {
    const user = await Users.findAll({
      where: {
        username: req.body.username,
      },
    });
    const match = await compare(req.body.password, user[0].password);
    if (!match) return res.status(400).json({ msg: 'salah' });
    const userId = user[0].id;
    const name = user[0].name;
    const username = user[0].username;
    const usia = user[0].usia;
    const gender = user[0].gender;
    const tb = user[0].tb;
    const bb = user[0].bb;
    const accessToken = jwt.sign({ userId, name, username, usia, gender, tb, bb }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '20s',
    });
    const refreshToken = jwt.sign({ userId, name, username, usia, gender, tb, bb }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: '1d',
    });
    await update(
      { refresh_token: refreshToken },
      {
        where: {
          id: userId,
        },
      }
    );
    res.json({
      accessToken,
      user: {
        id: userId,
        name,
        username,
        usia,
        gender,
        tb,
        bb,
      },
    });
  } catch (error) {
    res.status(404).json({ msg: 'salah' });
  }
};

export default {
  getUsers,
  getUserByUsername,
  loginHandler,
  register,
  Login,
  initialEnpoint,
  logout,
};
