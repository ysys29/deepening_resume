import express from 'express';
import { prisma } from '../utils/prisma.utils.js';
import bcrypt from 'bcrypt';

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

export default router;
