import { HTTP_STATUS } from '../constants/http-status.constant.js';

export class UsersController {
  constructor(usersService) {
    this.usersService = usersService;
  }

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

      return res
        .status(HTTP_STATUS.OK)
        .json({ message: '회원가입이 완료되었습니다.', data: createdUser });
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

      return res
        .status(HTTP_STATUS.OK)
        .json({ message: '로그인에 성공했습니다.', accessToken, refreshToken });
    } catch (error) {
      next(error);
    }
  };

  //내 정보 조회 api
  getUserById = async (req, res, next) => {
    try {
      const { userId } = req.user;

      const user = await this.usersService.findUserById(userId);

      return res
        .status(HTTP_STATUS.OK)
        .json({ message: '내 정보 조회에 성공했습니다.', data: user });
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

      return res
        .status(HTTP_STATUS.CREATED)
        .json({ message: '토큰을 재발급했습니다.', accessToken, refreshToken });
    } catch (error) {
      next(error);
    }
  };

  //로그아웃
  logoutUser = async (req, res, next) => {
    try {
      const { userId } = req.user;

      await this.usersService.deleteRefreshToken(userId);

      return res
        .status(HTTP_STATUS.OK)
        .json({ message: '로그아웃을 완료했습니다.', userId });
    } catch (error) {
      next(error);
    }
  };
}
