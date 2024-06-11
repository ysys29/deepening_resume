import { beforeEach, describe, jest, test, expect } from '@jest/globals';
import { UsersRepository } from '../../../src/repositories/users.repository';
import { dummyUsers } from '../../dummies/users.dummy';

const mockPrisma = {
  users: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
};

const usersRepository = new UsersRepository(mockPrisma);

describe('UsersRepository Unit Test --유저 관련 db 조회', () => {
  beforeEach(() => {
    jest.resetAllMocks(); // 모든 Mock을 초기화합니다
  });

  test('createUser Method -- 유저 정보 생성', async () => {
    // GIVEN
    const createUserParams = dummyUsers[0];

    // WHEN
    await usersRepository.createUser(
      createUserParams.email,
      createUserParams.password,
      createUserParams.name
    );

    // THEN
    expect(mockPrisma.users.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.users.create).toHaveBeenCalledWith({
      data: {
        email: createUserParams.email,
        password: createUserParams.password,
        name: createUserParams.name,
      },
    });
  });

  test('findUserById Method -- userId를 기반으로 유저 정보 검색', async () => {
    // GIVEN
    const userId = 1;

    // WHEN
    await usersRepository.findUserById(userId);

    // THEN
    expect(mockPrisma.users.findUnique).toHaveBeenCalledTimes(1);
    expect(mockPrisma.users.findUnique).toHaveBeenCalledWith({
      where: { userId },
    });
  });

  test('findUserByEmail Method -- email을 기반으로 유저 정보 검색', async () => {
    // GIVEN
    const userEmail = dummyUsers[1].email;

    // WHEN
    await usersRepository.findUserByEmail(userEmail);

    // THEN
    expect(mockPrisma.users.findUnique).toHaveBeenCalledTimes(1);
    expect(mockPrisma.users.findUnique).toHaveBeenCalledWith({
      where: { email: userEmail },
    });
  });
});
