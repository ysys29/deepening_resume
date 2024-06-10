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
}
