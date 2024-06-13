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
    // GIVEN
    const signUpData = {
      ...dummyUsers[0],
      verifyPassword: dummyUsers[0].password,
    };
    mockRequest.body = signUpData;
    usersService.createUser.mockResolvedValue(dummyUsers[1]);

    // WHEN
    await usersController.createUser(mockRequest, mockResponse, mockNext);

    // THEN
    expect(usersService.createUser).toHaveBeenCalledTimes(1);
    expect(usersService.createUser).toHaveBeenCalledWith(
      signUpData.email,
      signUpData.password,
      signUpData.verifyPassword,
      signUpData.name
    );
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: '회원가입이 완료되었습니다.',
      data: dummyUsers[1],
    });
  });

  // 로그인
  test('loginUser Method', async () => {
    // GIVEN
    const { email, password } = dummyUsers[1];
    const mockAccessToken = 'testAccessToken';
    const mockRefreshToken = 'testRefreshToken';
    mockRequest.body = { email, password };

    //로그인 메서드 반환값 설정
    usersService.loginUser.mockResolvedValue(dummyUsers[1]);
    //토큰 발급 메서드 반환값 설정
    usersService.createAccessAndRefreshToken.mockResolvedValue({
      accessToken: mockAccessToken,
      refreshToken: mockRefreshToken,
    });

    // WHEN
    await usersController.loginUser(mockRequest, mockResponse, mockNext);

    // THEN
    //로그인 메서드 실행 여부
    expect(usersService.loginUser).toHaveBeenCalledTimes(1);
    expect(usersService.loginUser).toHaveBeenCalledWith(email, password);

    //토큰 발급 메서드 실행 여부
    expect(usersService.createAccessAndRefreshToken).toHaveBeenCalledTimes(1);
    expect(usersService.createAccessAndRefreshToken).toHaveBeenCalledWith(
      dummyUsers[1].userId
    );

    //리프레시 토큰 저장 메서드 실행 여부
    expect(usersService.addOrUpdateRefreshToken).toHaveBeenCalledTimes(1);
    expect(usersService.addOrUpdateRefreshToken).toHaveBeenCalledWith(
      dummyUsers[1].userId,
      mockRefreshToken
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: '로그인에 성공했습니다.',
      accessToken: mockAccessToken,
      refreshToken: mockRefreshToken,
    });
  });

  // 내 정보 조회
  test('getUserById Method', async () => {
    // GIVEN
    mockRequest.user = dummyUsers[1];
    usersService.findUserById.mockResolvedValue(dummyUsers[1]);

    // WHEN
    await usersController.getUserById(mockRequest, mockResponse, mockNext);

    // THEN
    expect(usersService.findUserById).toHaveBeenCalledTimes(1);
    expect(usersService.findUserById).toHaveBeenCalledWith(
      mockRequest.user.userId
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: '내 정보 조회에 성공했습니다.',
      data: mockRequest.user,
    });
  });

  // 토큰 재발급
  test('reissueToken Method', async () => {
    // GIVEN
    mockRequest.user.userId = dummyUsers[1].userId;
    const mockAccessToken = 'testNewAccessToken';
    const mockRefreshToken = 'testNewRefreshToken';

    //토큰 생성 메서드 반환값 설정
    usersService.createAccessAndRefreshToken.mockResolvedValue({
      accessToken: mockAccessToken,
      refreshToken: mockRefreshToken,
    });

    // WHEN
    await usersController.reissueToken(mockRequest, mockResponse, mockNext);

    // THEN
    expect(usersService.createAccessAndRefreshToken).toHaveBeenCalledTimes(1);
    expect(usersService.createAccessAndRefreshToken).toHaveBeenCalledWith(
      mockRequest.user.userId
    );

    expect(usersService.addOrUpdateRefreshToken).toHaveBeenCalledTimes(1);
    expect(usersService.addOrUpdateRefreshToken).toHaveBeenCalledWith(
      mockRequest.user.userId,
      mockRefreshToken
    );

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: '토큰을 재발급했습니다.',
      accessToken: mockAccessToken,
      refreshToken: mockRefreshToken,
    });
  });

  //로그아웃
  test('logoutUser Method', async () => {
    // GIVEN
    mockRequest.user.userId = dummyUsers[1].userId;

    // WHEN
    await usersController.logoutUser(mockRequest, mockResponse, mockNext);

    // THEN
    expect(usersService.deleteRefreshToken).toHaveBeenCalledTimes(1);
    expect(usersService.deleteRefreshToken).toHaveBeenCalledWith(
      mockRequest.user.userId
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: '로그아웃을 완료했습니다.',
      userId: mockRequest.user.userId,
    });
  });
});
