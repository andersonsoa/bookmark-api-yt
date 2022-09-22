import { afterAll, beforeAll, describe } from '@jest/globals';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';
import { EditUserDto } from 'src/user/dto';
import { AppModule } from '../src/app.module';
import { AuthDto } from '../src/auth/dto';
import { PrismaService } from '../src/prisma/prisma.service';

describe('App (e2e)', () => {
  const PORT = 3332;

  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init();
    await app.listen(PORT);

    prisma = app.get(PrismaService);

    await prisma.cleanDb();

    pactum.request.setBaseUrl(`http://localhost:${PORT}`);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'anderson.ceu@gmail.com',
      password: '123qwe',
    };

    describe('Signup', () => {
      it('should throw if no body provided', () => {
        return pactum.spec().post(`/auth/signup`).expectStatus(400);
      });

      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post(`/auth/signup`)
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post(`/auth/signup`)
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('should signup', () => {
        return pactum
          .spec()
          .post(`/auth/signup`)
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Signin', () => {
      it('should throw if no body provided', () => {
        return pactum.spec().post(`/auth/signin`).expectStatus(400);
      });

      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post(`/auth/signin`)
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post(`/auth/signin`)
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('should signin', () => {
        return pactum
          .spec()
          .post(`/auth/signin`)
          .withBody(dto)
          .expectStatus(200)
          .stores('accessToken', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{accessToken}',
          })
          .expectStatus(200);
      });
    });

    describe('Edit user', () => {
      const dto: EditUserDto = {
        firstName: 'Anderson',
        lastName: 'Soares',
      };

      it('should edit user', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{accessToken}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.lastName);
      });
    });
  });

  describe('Bookmarks', () => {
    describe('Get empty bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{accessToken}',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'First Bookmark',
        link: 'https://www.youtube.com/watch?v=GHTA143_b-s',
      };

      it('should create bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{accessToken}',
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{accessToken}',
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{accessToken}',
          })
          .expectStatus(200)
          .expectBodyContains(`$S{bookmarkId}`);
      });
    });

    describe('Edit bookmark by id', () => {
      const dto: EditBookmarkDto = {
        title: 'NestJs Course for Beginners - Create a REST API',
        description:
          'Learn NestJs by building a CRUD REST API with end-to-end tests using modern web development techniques. NestJs is a rapidly growing node js framework that helps build scalable and maintainable backend applications.',
      };

      it('should edit bookmark by id', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{accessToken}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description);
      });
    });

    describe('Delete bookmark by id', () => {
      it('should delete bookmark by id', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{accessToken}',
          })
          .expectStatus(204);
      });

      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{accessToken}',
          })
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });
});
