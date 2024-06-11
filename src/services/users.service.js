import { UsersRepository } from '../repositories/users.repository.js';
import bcrypt from 'bcrypt';
import { createAccessToken, createRefreshToken } from '../utils/tokens.js';
import { saltHashRound } from '../constants/hash.constant.js';
import { TokensRepository } from '../repositories/tokens.repository.js';
import { HttpError } from '../errors/http.error.js';

export class UsersService {
  usersRepository = new UsersRepository();
  tokensRepository = new TokensRepository();

  //회원가입
  createUser = async (email, password, verifyPassword, name) => {
    if (password !== verifyPassword) {
      throw new HttpError.BadRequest('입력한 두 비밀번호가 일치하지 않습니다.');
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

  //로그인
  loginUser = async (email, password) => {
    const user = await this.usersRepository.findUserByEmail(email);

    const decodedPassword = user
      ? await bcrypt.compare(password, user.password)
      : null;

    if (!user || !decodedPassword) {
      throw new HttpError.BadRequest('인증 정보가 유효하지 않습니다.');
    }

    return user;
  };

  //토큰 생성
  createAccessAndRefreshToken = async (userId) => {
    const accessToken = createAccessToken(userId);
    const refreshToken = createRefreshToken(userId);

    return { accessToken, refreshToken };
  };

  //리프레시 토큰 저장소 업데이트(추가)
  addOrUpdateRefreshToken = async (userId, refreshToken) => {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, saltHashRound);

    await this.tokensRepository.upsertRefreshToken(userId, hashedRefreshToken);
  };

  //리프레시 토큰 저장소 토큰 삭제
  deleteRefreshToken = async (userId) => {
    await this.tokensRepository.deleteRefreshToken(userId);
  };

  //내 정보 조회
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
