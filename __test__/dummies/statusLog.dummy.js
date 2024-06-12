import { dummyUsers } from './users.dummy';

export const dummyLogs = [
  {
    resumeHistoryId: 1,
    recruiterId: 3,
    resumeId: 1,
    oldStatus: 'APPLY',
    newStatus: 'INTERVIEW',
    reason: '채용합니다',
    createdAt: new Date(),
    user: dummyUsers[3],
  },
  {
    resumeHistoryId: 2,
    recruiterId: 3,
    resumeId: 1,
    oldStatus: 'APPLY',
    newStatus: 'INTERVIEW1',
    reason: '채용합니다',
    createdAt: new Date(new Date().getTime() + 1000),
    user: dummyUsers[3],
  },
  {
    resumeHistoryId: 3,
    recruiterId: 3,
    resumeId: 1,
    oldStatus: 'INTERVIEW1',
    newStatus: 'INTERVIEW2',
    reason: '채용합니다',
    createdAt: new Date(new Date().getTime() + 2000),
    user: dummyUsers[3],
  },
];
