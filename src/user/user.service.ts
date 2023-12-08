import { Injectable } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable({})
export class UserService {
  constructor(private db: DatabaseService) {}

  // async editUser(userId: string, dto: EditUserDto) {
  //   const user = await this.prisma.user.update({
  //     where: {
  //       id: userId,
  //     },
  //     data: {
  //       ...dto,
  //     },
  //     select: {
  //       id: true,
  //       email: true,
  //       firstName: true,
  //       lastName: true,
  //     },
  //   });

  //   return user;
  // }

  async listUsers() {
    return this.db.db.query.users.findMany();
  }
}
