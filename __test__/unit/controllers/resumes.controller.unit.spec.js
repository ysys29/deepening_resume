import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { ResumesController } from '../../../src/controllers/resumes.controller.js';
import { dummyResumes } from '../../dummies/resumes.dummy.js';
import { dummyUsers } from '../../dummies/users.dummy.js';
import { dummyLogs } from '../../dummies/statusLog.dummy.js';

const resumesService = {
  createResume: jest.fn(),
  findAllResumes: jest.fn(),
  findResume: jest.fn(),
  updateResume: jest.fn(),
  deleteResume: jest.fn(),
  updateResumeStatus: jest.fn(),
  findStatusLogs: jest.fn(),
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

const resumesController = new ResumesController(resumesService);

describe('ResumesController Unit Test', () => {
  beforeEach(() => {
    jest.resetAllMocks(); // 모든 Mock을 초기화합니다.

    // mockResponse.status의 경우 메서드 체이닝으로 인해 반환값이 Response(자신: this)로 설정되어야합니다.
    mockResponse.status.mockReturnValue(mockResponse);
  });

  //이력서 생성
  test('createResume Method', async () => {
    // GIVEN
    const { title, content } = dummyResumes[0];
    mockRequest.user = dummyUsers[1];
    mockRequest.body = { title, content };

    resumesService.createResume.mockResolvedValue(dummyResumes[1]);

    // WHEN
    await resumesController.createResume(mockRequest, mockResponse, mockNext);

    // THEN
    expect(resumesService.createResume).toHaveBeenCalledTimes(1);
    expect(resumesService.createResume).toHaveBeenCalledWith(
      mockRequest.user.userId,
      mockRequest.body.title, // 그냥 title이랑 content로 적어도 될거같기도 하고...
      mockRequest.body.content
    );

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: '이력서를 생성했습니다.',
      data: dummyResumes[1],
    });
  });

  // 모든 이력서 조회
  test('findAllResumes Method', async () => {
    // GIVEN
    const mockResumes = [...dummyResumes].splice(1, 4);
    const mockSort = 'asc';
    const mockStatus = 'apply';
    mockRequest.user = dummyUsers[1];
    mockRequest.query = { sort: mockSort, status: mockStatus };

    resumesService.findAllResumes.mockResolvedValue(mockResumes);

    // WHEN
    await resumesController.findAllResumes(mockRequest, mockResponse, mockNext);

    // THEN
    expect(resumesService.findAllResumes).toHaveBeenCalledTimes(1);
    expect(resumesService.findAllResumes).toHaveBeenCalledWith(
      mockRequest.user.userId,
      mockRequest.user.role,
      mockSort,
      mockStatus
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: '이력서 목록',
      data: mockResumes,
    });
  });

  // 이력서 상세 조회
  test('findResume Method', async () => {
    // GIVEN
    mockRequest.user = dummyUsers[1];
    mockRequest.params.resumeId = dummyResumes[1].resumeId;
    resumesService.findResume.mockResolvedValue(dummyResumes[1]);

    // WHEN
    await resumesController.findResume(mockRequest, mockResponse, mockNext);

    // THEN
    expect(resumesService.findResume).toHaveBeenCalledTimes(1);
    expect(resumesService.findResume).toHaveBeenCalledWith(
      mockRequest.params.resumeId,
      mockRequest.user.userId,
      mockRequest.user.role
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: `${mockRequest.params.resumeId}번 이력서`,
      data: dummyResumes[1],
    });
  });

  // 이력서 수정
  test('editResume Method', async () => {
    // GIVEN
    const newTitle = '테스트용 수정 제목';
    const newContent = '테스트용 수정 내용';
    mockRequest.user = dummyUsers[1];
    mockRequest.params.resumeId = dummyResumes[1].resumeId;
    mockRequest.body = { title: newTitle, content: newContent };

    const updatedResume = {
      ...dummyResumes[1],
      title: newTitle,
      content: newContent,
    };
    resumesService.updateResume.mockResolvedValue(updatedResume);

    // WHEN
    await resumesController.editResume(mockRequest, mockResponse, mockNext);

    // THEN
    expect(resumesService.updateResume).toHaveBeenCalledTimes(1);
    expect(resumesService.updateResume).toHaveBeenCalledWith(
      mockRequest.user.userId,
      mockRequest.params.resumeId,
      newTitle,
      newContent
    );

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: '이력서를 수정했습니다.',
      data: updatedResume,
    });
  });

  //이력서 삭제
  test('deleteResume Method', async () => {
    // GIVEN
    mockRequest.user = dummyUsers[1];
    mockRequest.params.resumeId = dummyResumes[1].resumeId;

    // WHEN
    await resumesController.deleteResume(mockRequest, mockResponse, mockNext);

    // THEN
    expect(resumesService.deleteResume).toHaveBeenCalledTimes(1);
    expect(resumesService.deleteResume).toHaveBeenCalledWith(
      mockRequest.user.userId,
      mockRequest.params.resumeId
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: '이력서 삭제에 성공했습니다.',
      resumeId: mockRequest.params.resumeId,
    });
  });

  //이력서 상태 수정
  test('updateResumeStatus Method', async () => {
    // GIVEN
    const mockStatus = 'DROP';
    const mockReason = '테스트용 이력서 상태 수정 이류';
    mockRequest.user.userId = dummyUsers[3].userId;
    mockRequest.params.resumeId = dummyResumes[1].resumeId;
    mockRequest.body = { status: mockStatus, reason: mockReason };

    const updatedResume = { ...dummyResumes[1], status: mockStatus };
    resumesService.updateResumeStatus.mockResolvedValue(updatedResume);

    // WHEN
    await resumesController.updateResumeStatus(
      mockRequest,
      mockResponse,
      mockNext
    );

    // THEN
    expect(resumesService.updateResumeStatus).toHaveBeenCalledTimes(1);
    expect(resumesService.updateResumeStatus).toHaveBeenCalledWith(
      mockRequest.user.userId,
      mockRequest.params.resumeId,
      mockRequest.body.status,
      mockRequest.body.reason
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: `${mockRequest.params.resumeId}번 이력서의 상태변경 성공`,
      data: updatedResume,
    });
  });

  //이력서 상태 수정 로그 조회
  test('findStatusLogs Method', async () => {
    // GIVEN
    const mockLogs = dummyLogs;
    mockRequest.params.resumeId = dummyResumes[1].resumeId;
    resumesService.findStatusLogs.mockResolvedValue(mockLogs);

    // WHEN
    await resumesController.checkStatusLogs(
      mockRequest,
      mockResponse,
      mockNext
    );

    // THEN
    expect(resumesService.findStatusLogs).toHaveBeenCalledTimes(1);
    expect(resumesService.findStatusLogs).toHaveBeenCalledWith(
      mockRequest.params.resumeId
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: `${mockRequest.params.resumeId}번 이력서의 상태 변경 이력`,
      data: mockLogs,
    });
  });
});
