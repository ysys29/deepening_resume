import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { UsersService } from '../../../src/services/users.service.js';
import { dummyUsers } from '../../dummies/users.dummy.js';
import bcrypt from 'bcrypt';

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

describe('usersService Unit Test', () => {
  beforeEach(() => {
    jest.resetAllMocks(); // 모든 Mock을 초기화합니다.
  });

  test('createUser Method --회원가입 성공', async () => {
    // GIVEN
    const createUserParams = {
      ...dummyUsers[0],
      verifyPassword: dummyUsers[0].password,
    };

    const hashedPassword = 'testHashedPassword';
    jest
      .spyOn(bcrypt, 'hash')
      .mockImplementation((data, salt) => Promise.resolve(hashedPassword));

    // jest
    //   .spyOn(bcrypt, 'compare')
    //   .mockImplementation((password, hashedPassword) => Promise.resolve(false));

    const { password: _pw, ...mockUser } = dummyUsers[1];
    usersRepository.createUser.mockReturnValue(mockUser);

    // WHEN
    const createdUser = await usersService.createUser(
      createUserParams.email,
      createUserParams.password,
      createUserParams.verifyPassword,
      createUserParams.name
    );

    // THEN
    expect(createdUser).toEqual(mockUser);
    expect(usersRepository.createUser).toHaveBeenCalledTimes(1);
    expect(usersRepository.createUser).toHaveBeenCalledWith(
      createUserParams.email,
      hashedPassword,
      createUserParams.name
    );
  });

  test('loginUser Method --로그인 성공', async () => {
    // // GIVEN
    // const loginUserParams = {
    //   email: dummyUsers[1].email,
    //   password: dummyUsers[1].password,
    // };
    // // const decodedPassword = true;
    // // jest
    // //   .spyOn(bcrypt, 'compare')
    // //   .mockImplementation((password, hashedPassword) => Promise.resolve(false));
    // // WHEN
    // await usersService.loginUser(
    //   loginUserParams.email,
    //   loginUserParams.password
    // );
    // const decodedPassword = true;
    // // THEN
    // expect(usersRepository.findUserByEmail).toHaveBeenCalledTimes(1);
    // expect(usersRepository.findUserByEmail).toHaveBeenCalledWith(email);
  });

  test('createAccessAndRefreshToken Method', async () => {
    // GIVEN
    // WHEN
    // THEN
  });

  test('addOrUpdateRefreshToken Method', async () => {
    // GIVEN
    // WHEN
    // THEN
  });

  test('deleteRefreshToken Method', async () => {
    // GIVEN
    // WHEN
    // THEN
  });

  test('findUserById Method', async () => {
    // GIVEN
    // WHEN
    // THEN
  });
});
