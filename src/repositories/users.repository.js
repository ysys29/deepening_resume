export class UsersRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  createUser = async (email, hashedPassword, name) => {
    const createdUser = await this.prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    return createdUser;
  };

  findUserById = async (userId) => {
    console.log(this.prisma);
    const user = await this.prisma.users.findUnique({ where: { userId } });

    return user;
  };

  findUserByEmail = async (email) => {
    const user = await this.prisma.users.findUnique({ where: { email } });

    return user;
  };
}
