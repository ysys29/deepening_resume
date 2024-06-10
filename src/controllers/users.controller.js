import { saltHashRound } from '../constants/hash.constant.js';
import { UsersService } from '../services/users.service.js';

export class UsersController {
  usersService = new UsersService();

  //회원가입 api
  createUser = async (req, res, next) => {
    try {
      const { email, password, verifyPassword, name } = req.body;

      const createdUser = await this.usersService.createUser(
        email,
        password,
        verifyPassword,
        name
      );

      return res.status(201).json({ data: createdUser });
    } catch (error) {
      next(error);
    }
  };

  //로그인 api
  loginUser = async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await this.usersService.loginUser(email, password);

      const { accessToken, refreshToken } =
        await this.usersService.createAccessAndRefreshToken(user.userId);

      await this.usersService.addOrUpdateRefreshToken(
        user.userId,
        refreshToken
      );

      return res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
      next(error);
    }
  };

  //내 정보 조회 api
  getUserById = async (req, res, next) => {
    try {
      const { userId } = req.user;

      const user = await this.usersService.findUserById(userId);

      return res.status(200).json({ data: user });
    } catch (error) {
      next(error);
    }
  };

  //토큰 재발급
  reissueToken = async (req, res, next) => {
    try {
      const { userId } = req.user;

      const { accessToken, refreshToken } =
        await this.usersService.createAccessAndRefreshToken(userId);

      await this.usersService.addOrUpdateRefreshToken(userId, refreshToken);

      return res.status(201).json({ accessToken, refreshToken });
    } catch (error) {
      next(error);
    }
  };

  //로그아웃
  logoutUser = async (req, res, next) => {
    try {
      const { userId } = req.user;

      await this.usersService.deleteRefreshToken(userId);

      return res.status(200).json({ message: '로그아웃을 완료했습니다.' });
    } catch (error) {
      next(error);
    }
  };
}
