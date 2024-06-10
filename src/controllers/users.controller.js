import { UsersService } from '../services/users.service.js';

export class UsersController {
  usersService = new UsersService();

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
