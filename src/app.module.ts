import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from './config/configuration';
import mongodbConfig from './config/mongodb.config';
import { DatabaseModule } from './database/database.module';
import { UserController } from './features/users/controllers/user.controller';
import { CreateUserUseCase } from './features/users/usecases/create-user.usecase';
import { GetUserUseCase } from './features/users/usecases/get-user.usecase';
import { UpdateUserUseCase } from './features/users/usecases/update-user.usecase';
import { DeleteUserUseCase } from './features/users/usecases/delete-user.usecase';
import { ListUsersUseCase } from './features/users/usecases/list-users.usecase';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      load: [configuration, mongodbConfig],
      cache: true,
      expandVariables: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('mongodb.uri'),
      }),
      inject: [ConfigService],
    }),
    DatabaseModule,
  ],
  controllers: [AppController, UserController],
  providers: [
    AppService,
    CreateUserUseCase,
    GetUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    ListUsersUseCase,
  ],
})
export class AppModule {}
