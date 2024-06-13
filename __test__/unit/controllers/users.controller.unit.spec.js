import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { UsersController } from '../../../src/controllers/users.controller.js';
import { dummyUsers } from '../../dummies/users.dummy';

// TODO: template 이라고 되어 있는 부분을 다 올바르게 수정한 후 사용해야 합니다.

const usersService = {
  createUser: jest.fn(),
  loginUser: jest.fn(),
  createAccessAndRefreshToken: jest.fn(),
  addOrUpdateRefreshToken: jest.fn(),
  deleteRefreshToken: jest.fn(),
  findUserById: jest.fn(),
};

const mockRequest = {
  user: jest.fn(),
  body: jest.fn(),
  query: jest.fn(),
  params: jest.fn(),
};

const mockResponse = {
  status: jest.fn(),
  json: jest.fn(),
};

const mockNext = jest.fn();

const usersController = new UsersController(usersService);

// 유저 컨트롤러 파일 테스트
describe('usersController Unit Test', () => {
  beforeEach(() => {
    jest.resetAllMocks(); // 모든 Mock을 초기화합니다.

    // mockResponse.status의 경우 메서드 체이닝으로 인해 반환값이 Response(자신: this)로 설정되어야합니다.
    mockResponse.status.mockReturnValue(mockResponse);
  });

  // 회원가입
  test('createUser Method', async () => {
    // // GIVEN
    // mockRequest.body = {
    //   ...dummyUsers[0],
    //   verifyPassword: dummyUsers[0].password,
    // };
    // // WHEN
    // const createdUser = await usersController.createUser(
    //   mockRequest,
    //   mockResponse,
    //   mockNext
    // );
    // // THEN
  });

  test('loginUser Method', async () => {
    // GIVEN
    // WHEN
    // THEN
  });

  test('getUserById Method', async () => {
    // GIVEN
    // WHEN
    // THEN
  });

  test('reissueToken Method', async () => {
    // GIVEN
    // WHEN
    // THEN
  });

  test('logoutUser Method', async () => {
    // GIVEN
    // WHEN
    // THEN
  });
});
