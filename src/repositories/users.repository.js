import { prisma } from '../utils/prisma.utils.js';

export class UsersRepository {
  findUserById = async (userId) => {
    const user = await prisma.users.findUnique({ where: { userId } });

    return user;
  };
}
