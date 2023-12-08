import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
// import { BookmarkModule } from './bookmark/bookmark.module';
// import { PrismaModule } from './prisma/prisma.module';
// import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // AuthModule,
    UserModule,
    DatabaseModule,
    // BookmarkModule,
    // PrismaModule,
  ],
})
export class AppModule {}
