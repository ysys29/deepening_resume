import { UsersRepository } from '../repositories/users.repository.js';
import bcrypt from 'bcrypt';
import { createAccessToken, createRefreshToken } from '../utils/tokens.js';
import { saltHashRound } from '../constants/hash.constant.js';

export class UsersService {
  usersRepository = new UsersRepository();

  createUser = async (email, password, verifyPassword, name) => {
    if (password !== verifyPassword) {
      throw new Error('입력한 두 비밀번호가 일치하지 않습니다.');
    }

    const hashedPassword = await bcrypt.hash(password, saltHashRound);

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

  loginUser = async (email, password) => {
    const user = await this.usersRepository.findUserByEmail(email);

    const decodedPassword = user
      ? await bcrypt.compare(password, user.password)
      : null;

    if (!user || !decodedPassword) {
      throw new Error('인증 정보가 유효하지 않습니다.');
    }

    return user;
  };

  createAccessAndRefreshToken = async (userId) => {
    const accessToken = createAccessToken(userId);
    const refreshToken = createRefreshToken(userId);

    // const existedRefreshToken =
    //   await this.usersRepository.findRefreshToken(userId);

    // const hashedRefreshToken = await bcrypt.hash(refreshToken, saltHashRound);

    // if (!existedRefreshToken) {
    //   await this.usersRepository.addRefreshToken(userId, hashedRefreshToken);
    // } else if (existedRefreshToken) {
    //   await this.usersRepository.updateRefreshToken(userId, hashedRefreshToken);
    // }

    return { accessToken, refreshToken };
  };

  addOrUpdateRefreshToken = async (userId, refreshToken) => {
    const existedRefreshToken =
      await this.usersRepository.findRefreshToken(userId);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, saltHashRound);

    if (!existedRefreshToken) {
      await this.usersRepository.addRefreshToken(userId, hashedRefreshToken);
    } else if (existedRefreshToken) {
      await this.usersRepository.updateRefreshToken(userId, hashedRefreshToken);
    }
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
