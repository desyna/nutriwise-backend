import jwt from "jsonwebtoken";
import users from '../model/user_model.js';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403); // Ubah status menjadi 403
    if (!decoded || !decoded.username) return res.sendStatus(401); // Periksa keberadaan username dalam decoded
    req.username = decoded.username;
    next();
  });
};

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken; // Menggunakan req.cookies
    if (!refreshToken) return res.sendStatus(401);
    const user = await users.findAll({
      where: {
        refresh_token: refreshToken,
      },
    });
    if (!user[0]) return res.sendStatus(403);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.sendStatus(403);
      const name = user[0].name;
      const username = user[0].username;
      // const email = user[0].email;
      const accessToken = jwt.sign({ name, username }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "60s",
      });
      res.json({ accessToken });
    });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};
