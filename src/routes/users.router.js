import express from 'express';
import { prisma } from '../utils/prisma.utils.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import refreshMiddleware from '../middlewares/refresh.middleware.js';
import { signUpValidator } from '../middlewares/validators/signUp-validator.middleware.js';
import { signInValidator } from '../middlewares/validators/signIn-validator.middleware.js';
import { UsersController } from '../controllers/users.controller.js';
import { UsersService } from '../services/users.service.js';
import { UsersRepository } from '../repositories/users.repository.js';
import { TokensRepository } from '../repositories/tokens.repository.js';

const router = express.Router();

const usersRepository = new UsersRepository(prisma);
const tokensRepository = new TokensRepository(prisma);
const usersService = new UsersService(usersRepository, tokensRepository);
const usersController = new UsersController(usersService);

//회원가입 api === 리팩토링 완
router.post('/sign-up', signUpValidator, usersController.createUser);

//로그인 api === 리팩토링 완
router.post('/sign-in', signInValidator, usersController.loginUser);

//내 정보 조회 api === 리팩토링 완
router.get('/users', authMiddleware, usersController.getUserById);

//토큰 재발급 api === 리팩토링 완
router.post('/tokens', refreshMiddleware, usersController.reissueToken);

//로그아웃 api === 리팩토링 중
router.post('/sign-out', refreshMiddleware, usersController.logoutUser);

export default router;
