import users from '../model/user_model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const getUsers = async (req, res) => {
  try {
    const user = await users.findAll();
    res.json(user);
  } catch (error) {
    console, console.log(error);
  }
};

export const register = async (req, res) => {
  const { name, username, password, age, gender, height, weight, activity } = req.body;
  const user = await users.findByPk(username);
  // Check username user
  if (user) {
    return res.status(400).json({
      status: 'Error',
      message: `User with username ${username} has exist!`,
    });
  }
  // Post data user
  const salt = await bcrypt.genSalt();
  const hashpassword = await bcrypt.hash(password, salt);
  try {
    await users.create({
      name: name,
      username: username,
      password: hashpassword,
      age: age,
      gender: gender,
      height: height,
      weight: weight,
      activity: activity,
    });
    res.status(200).json({
      status: 'success',
      message: 'User registered successfully',
      users: users,
    });
  } catch (error) {
    console.log(error);
  }
};

export const login = async (req, res) => {
  try {
    const user = await users.findOne({
      where: {
        username: req.body.username,
      },
    });
    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match)
      return res.status(400).json({
        status: 'Failed',
        message: 'Wrong password!',
      });
    const name = user.name;
    const username = user.username;
    const age = user.age;
    const gender = user.gender;
    const height = user.height;
    const weight = user.weight;
    const accessToken = jwt.sign({ name, username, age, gender, height, weight }, process.env.ACCESS_TOKEN_SECRET);
    const refreshToken = jwt.sign({ name, username, age, gender, height, weight }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: '1d',
    });
    await users.update(
      { refresh_token: refreshToken },
      {
        where: {
          username: username,
        },
      }
    );
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      status: 'success',
      message: 'User registered successfully',
      token: accessToken,
      users: user,
    });
  } catch (error) {
    res.status(404).json({
      status: 'Failed',
      message: 'Wrong username or password!',
    });
  }
};

export const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken; // Menggunakan req.cookies
  if (!refreshToken) return res.sendStatus(204);
  const user = await findAll({
    where: {
      refresh_token: refreshToken,
    },
  });
  if (!user[0]) return res.sendStatus(204);
  const username = user[0].username;
  await update(
    {
      refresh_token: null,
    },
    {
      where: {
        username: username,
      },
    }
  );
  res.clearCookie('refreshToken');
  return res.sendStatus(200);
};

export const updateUser = async (req, res) => {
  try {
      const { username } = req.params; // Ambil username user yang ingin diubah dari URL

      const { name, password, age, gender, height, weight, activity } = req.body;
      let updatedData = {
          name,
          age,
          height,
          weight,
          gender,
          activity
      };

      if (password) {
          const encryptPassword = await bcrypt.hash(password, 5);
          updatedData.password = encryptPassword;
      }

      const result = await users.update(updatedData, {
          where: {
              username: username
          }
      });

      // Periksa apakah ada baris yang terpengaruh (diupdate)
      if (result[0] === 0) {
          return res.status(404).json({
              status: 'failed',
              message: 'User not found or no changes applied',
              updatedData: updatedData,
              result
          });
      }

      // Ambil data terbaru setelah update
      const updatedUser = await users.findByPk(username);

      res.status(200).json({
          status: 'success',
          message: 'User updated successfully',
          updatedUser
      });
  } catch (error) {
      console.log(`Error: ${error.message}`);
      res.status(500).json({ message: 'Internal server error' });
  }
};