import express from 'express';
import { prisma } from '../utils/prisma.utils.js';
import bcrypt, { compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

//회원가입 api
router.post('/sign-up', async (req, res, next) => {
  const { email, password, verifyPassword, name, status } = req.body;
  if (password !== verifyPassword) {
    return res
      .status(400)
      .json({ errorMessage: '비밀번호 확인이 일치하지 않습니다.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.users.create({
    data: {
      email,
      password: hashedPassword,
      name,
      status,
    },
  });

  return res.status(201).json({ message: '회원가입이 완료되었습니다.' });
});

//로그인 api
router.post('/sign-in', async (req, res, next) => {
  const { email, password } = req.body;

  const user = await prisma.users.findFirst({ where: { email } });
  if (!user) {
    return res.status(401).json({ errorMessage: '존재하지 않는 이메일' });
  }
  let decodedPassword = await bcrypt.compare(password, user.password);
  if (!decodedPassword) {
    return res
      .status(401)
      .json({ errorMessage: '비밀번호가 일치하지 않습니다.' });
  }

  const token = jwt.sign(
    {
      userId: user.userId,
    },
    'user_secret_key',
    { expiresIn: '12h' }
  );
  res.cookie('authorization', `Bearer ${token}`);
  return res.status(200).json({ message: '로그인에 성공했습니다.' });
});

export default router;
