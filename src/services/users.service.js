import { UsersRepository } from '../repositories/users.repository.js';
import bcrypt from 'bcrypt';

export class UsersService {
  usersRepository = new UsersRepository();

  createUser = async (email, password, verifyPassword, name) => {
    if (password !== verifyPassword) {
      throw new Error('입력한 두 비밀번호가 일치하지 않습니다.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.usersRepository.createUser(
      email,
      hashedPassword,
      name
    );

    return {
      userId: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  };

  findUserById = async (userId) => {
    const user = await this.usersRepository.findUserById(userId);

    return {
      userId: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  };
}
