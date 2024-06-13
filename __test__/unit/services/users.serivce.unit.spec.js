import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { UsersService } from '../../../src/services/users.service.js';
import { dummyUsers } from '../../dummies/users.dummy';
import bcrypt from 'bcrypt';
import 'dotenv/config';
import jwt from 'jsonwebtoken';

const usersRepository = {
  createUser: jest.fn(),
  findUserById: jest.fn(),
  findUserByEmail: jest.fn(),
};
const tokensRepository = {
  findRefreshToken: jest.fn(),
  upsertRefreshToken: jest.fn(),
  deleteRefreshToken: jest.fn(),
};

const usersService = new UsersService(usersRepository, tokensRepository);

// 유저 서비스 파일 테스트
describe('Test userss.serveice.js', () => {
  beforeEach(() => {
    jest.resetAllMocks(); // 모든 Mock을 초기화합니다.
  });

  //회원가입 메서드 테스트
  describe('createUser method', () => {
    test('입력한 두 비밀번호가 일치하지 않을 때 에러', async () => {
      // GIVEN
      const { email, password, name } = dummyUsers[0];
      const verifyPassword = 'testPassword1234'; //일치하지 않는 비밀번호

      try {
        // WHEN
        await usersService.createUser(email, password, verifyPassword, name);
      } catch (error) {
        // THEN
        expect(error.message).toEqual(
          '입력한 두 비밀번호가 일치하지 않습니다.'
        );
      }
    });

    test('회원가입 성공했을 때 정보 반환', async () => {
      // GIVEN
      const { email, password, name } = dummyUsers[0];
      const verifyPassword = dummyUsers[0].password;
      const mockUser = dummyUsers[1];
      usersRepository.createUser.mockResolvedValue(mockUser);

      const hashedPassword = 'testHashedPassword';
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation((data, salt) => Promise.resolve(hashedPassword));

      // WHEN
      const user = await usersService.createUser(
        email,
        password,
        verifyPassword,
        name
      );

      //THEN
      expect(usersRepository.createUser).toHaveBeenCalledTimes(1);
      expect(usersRepository.createUser).toHaveBeenCalledWith(
        email,
        hashedPassword,
        name
      );
      expect(user).toEqual({
        userId: mockUser.userId,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });
  });

  //로그인 메서드 테스트
  describe('loginUser method', () => {
    test('해당하는 이메일의 사용자가 없을 때 에러', async () => {
      // GIVEN
      const nonExistentEmail = 'testEmail@example.com';
      const password = 'testPassword';
      usersRepository.findUserByEmail.mockResolvedValue(null);

      try {
        // WHEN
        await usersService.loginUser(nonExistentEmail, password);
      } catch (error) {
        // THEN
        expect(error.message).toEqual('인증 정보가 유효하지 않습니다.');
      }
    });

    test('해당하는 이메일의 사용자가 있지만 비밀번호가 일치하지 않을 때 에러', async () => {
      // GIVEN
      const email = dummyUsers[1].email;
      const doesNotMatchPassword = 'testDoesNotMatchPassword';

      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation((password, hashedPassword) =>
          Promise.resolve(false)
        );

      try {
        // WHEN
        await usersService.loginUser(email, doesNotMatchPassword);
      } catch (error) {
        // THEN
        expect(error.message).toEqual('인증 정보가 유효하지 않습니다.');
      }
    });

    test('해당하는 이메일의 사용자가 있고 비밀번호가 일치할 때 로그인 성공', async () => {
      // GIVEN
      const { email, password } = dummyUsers[1];
      usersRepository.findUserByEmail.mockResolvedValue(dummyUsers[1]);

      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation((password, hashedPassword) =>
          Promise.resolve(true)
        );

      // WHEN
      const user = await usersService.loginUser(email, password);

      // THEN
      expect(usersRepository.findUserByEmail).toHaveBeenCalledTimes(1);
      expect(usersRepository.findUserByEmail).toHaveBeenCalledWith(email);
    });
  });

  //토큰 발급 메서드 테스트
  describe('createAccessAndRefreshToken', () => {
    test('토큰 제대로 발급 되는지 테스트', async () => {
      // GIVEN
      const { userId } = dummyUsers[1];
      const mockAccessToken = 'testAccessToken';
      const mockRefreshToken = 'testRefreshToken';

      jest
        .spyOn(jwt, 'sign')
        .mockImplementationOnce(() => mockAccessToken)
        .mockImplementationOnce(() => mockRefreshToken);

      // WHEN
      const { accessToken, refreshToken } =
        await usersService.createAccessAndRefreshToken(userId);

      // THEN
      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(accessToken).toEqual(mockAccessToken);
      expect(refreshToken).toEqual(mockRefreshToken);
    });
  });

  //리프레시 토큰 저장소 업데이트(추가) 메서드 테스트
  describe('addOrUpdateRefreshToken method', () => {
    test('리프레시 토큰 추가 혹은 업뎃 성공 테스트', async () => {
      // GIVEN
      const userId = 1;
      const refreshToken = 'testRefreshToken';
      const hashedRefreshToken = 'testHashedRefreshToken';
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedRefreshToken);

      // WHEN
      await usersService.addOrUpdateRefreshToken(userId, refreshToken);

      // THEN
      expect(tokensRepository.upsertRefreshToken).toHaveBeenCalledTimes(1);
      expect(tokensRepository.upsertRefreshToken).toHaveBeenCalledWith(
        userId,
        hashedRefreshToken
      );
    });
  });

  //리프레시 토큰 저장소 삭제 메서드 테스트
  describe('deleteRefreshToken', () => {
    test('리프레시 토큰 삭제 성공 테스트 --토큰 있는지는 미들웨어에서 확인', async () => {
      // GIVEN
      const { userId } = dummyUsers[1];

      // WHEN
      await usersService.deleteRefreshToken(userId);

      // THEN
      expect(tokensRepository.deleteRefreshToken).toHaveBeenCalledTimes(1);
      expect(tokensRepository.deleteRefreshToken).toHaveBeenCalledWith(userId);
    });
  });

  //내 정보 조회 메서드 테스트
  describe('findUserById', () => {
    test('내 정보 조회해서 제대로 반환하는지 확인', async () => {
      // GIVEN
      const mockUser = dummyUsers[1];
      usersRepository.findUserById.mockResolvedValue(mockUser);

      // WHEN
      const user = await usersService.findUserById(mockUser.userId);

      // THEN
      expect(usersRepository.findUserById).toHaveBeenCalledTimes(1);
      expect(usersRepository.findUserById).toHaveBeenCalledWith(
        mockUser.userId
      );
      expect(user).toEqual({
        userId: mockUser.userId,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });
  });
});
