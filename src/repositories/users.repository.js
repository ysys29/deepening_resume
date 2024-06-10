import { prisma } from '../utils/prisma.utils.js';

export class UsersRepository {
  createUser = async (email, hashedPassword, name) => {
    const createdUser = await prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    return createdUser;
  };

  findUserById = async (userId) => {
    const user = await prisma.users.findUnique({ where: { userId } });

    return user;
  };

  findUserByEmail = async (email) => {
    const user = await prisma.users.findUnique({ where: { email } });

    return user;
  };
}
