import express from 'express';
import { prisma } from '../utils/prisma.utils.js';
import bcrypt, { compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import authMiddleware from '../middlewares/auth.middleware.js';
import joiSchemas from '../schemas/joi_schemas.js';

const router = express.Router();

//회원가입 api
router.post('/sign-up', async (req, res, next) => {
  try {
    const { email, password, verifyPassword, name, role } = req.body;

    await joiSchemas.signupSchema.validateAsync({
      email,
      password,
      verifyPassword,
      name,
      role,
    });

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
        role: role ? role.toUpperCase() : 'APPLICANT',
      },
    });

    return res.status(201).json({ message: '회원가입이 완료되었습니다.' });
  } catch (error) {
    next(error);
  }
});

//로그인 api
router.post('/sign-in', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    await joiSchemas.signinSchema.validateAsync({ email, password });

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
  } catch (error) {
    next(error);
  }
});

//내 정보 조회 api
router.get('/users', authMiddleware, async (req, res, next) => {
  const { userId } = req.user;

  const user = await prisma.users.findFirst({
    where: { userId: +userId },
    select: {
      userId: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return res.status(200).json({ data: user });
});

export default router;
