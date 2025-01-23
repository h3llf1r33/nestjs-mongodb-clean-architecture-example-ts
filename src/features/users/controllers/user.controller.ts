import {
  Body,
  Controller,
  Delete,
  Get,
  Next,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { NextFunction, Response } from 'express';
import {
  CreateUserDto,
  IUser,
  UpdateUserDto,
} from '../interfaces/user.interface';
import {
  createUserSchema,
  updateUserSchema,
} from '../json-schema/user.json-schema';
import { CreateUserUseCase } from '../usecases/create-user.usecase';
import {
  HttpMethodType,
  IFilterQuery,
  IPaginatedResponse,
  IPaginationQuery,
  IUseCaseInlineFunc,
} from '@denis_bruns/core';
import { GetUserUseCase } from '../usecases/get-user.usecase';
import { UpdateUserUseCase } from '../usecases/update-user.usecase';
import { DeleteUserUseCase } from '../usecases/delete-user.usecase';
import { ListUsersUseCase } from '../usecases/list-users.usecase';
import { nestJsRouteHandlerBuilder } from '@denis_bruns/nestjs-route-handler';

const DEFAULT_ALLOWED_METHODS = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'OPTIONS',
] as HttpMethodType[];

export function parseQueryParam<T>(
  param: string | undefined,
  defaultValue: T,
): T {
  if (!param) return defaultValue;

  try {
    return JSON.parse(param);
  } catch {
    try {
      return JSON.parse(decodeURIComponent(param));
    } catch (e) {
      console.error(e);
      return defaultValue;
    }
  }
}

@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
  ) {}

  @Post()
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    const handler = nestJsRouteHandlerBuilder<
      CreateUserDto,
      [IUseCaseInlineFunc<CreateUserDto, CreateUserDto, IUser>]
    >(
      {
        initialQueryReflector: {
          data: "$['body']",
        },
        handlers: [
          (query) => ({
            execute: () => this.createUserUseCase.execute(query),
          }),
        ],
        bodySchema: createUserSchema,
        errorToStatusCodeMapping: {
          409: [Error],
        },
      },
      {
        maxResponseSize: 1024 * 1024, // 1MB
        allowedMethods: DEFAULT_ALLOWED_METHODS,
      },
    );

    return handler(
      {
        body: JSON.stringify(createUserDto),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      },
      res,
      next,
    );
  }

  @Get(':id')
  async getUser(
    @Param('id') id: string,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    const handler = nestJsRouteHandlerBuilder<
      undefined,
      [IUseCaseInlineFunc<undefined, undefined, IUser>]
    >(
      {
        initialQueryReflector: {
          entityId: "$['pathParameters']['id']",
        },
        handlers: [
          (query) => ({
            execute: () => this.getUserUseCase.execute(query),
          }),
        ],
        errorToStatusCodeMapping: {
          404: [Error],
        },
      },
      {
        allowedMethods: DEFAULT_ALLOWED_METHODS,
      },
    );

    const event = {
      params: { id },
      method: 'GET',
      headers: { 'content-type': 'application/json' },
    };

    return handler(event, res, next);
  }

  @Get()
  async listUsers(
    @Query('filters') filters: string,
    @Query('pagination') pagination: string,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    const handler = nestJsRouteHandlerBuilder<
      undefined,
      [IUseCaseInlineFunc<undefined, undefined, IPaginatedResponse<IUser>>]
    >(
      {
        initialQueryReflector: {
          filterQuery: (event) => ({
            filters: parseQueryParam<IFilterQuery[]>(
              event.queryParameters?.filters,
              [],
            ),
            pagination: parseQueryParam<IPaginationQuery>(
              event.queryParameters?.pagination,
              { page: 1, limit: 10 },
            ),
          }),
        },
        handlers: [
          (query) => ({
            execute: () => this.listUsersUseCase.execute(query),
          }),
        ],
      },
      {
        allowedMethods: DEFAULT_ALLOWED_METHODS,
      },
    );

    return handler(
      {
        query: { filters, pagination },
        headers: {},
        method: 'GET',
      },
      res,
      next,
    );
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    const handler = nestJsRouteHandlerBuilder<
      UpdateUserDto,
      [IUseCaseInlineFunc<UpdateUserDto, UpdateUserDto, IUser>]
    >({
      initialQueryReflector: {
        entityId: "$['pathParameters']['id']",
        data: "$['body']",
      },
      handlers: [
        (query) => ({
          execute: () => this.updateUserUseCase.execute(query),
        }),
      ],
      bodySchema: updateUserSchema,
      errorToStatusCodeMapping: {
        404: [Error],
      },
    });

    return handler(
      {
        params: { id },
        body: JSON.stringify(updateUserDto),
        headers: { 'content-type': 'application/json' },
        method: 'PUT',
      },
      res,
      next,
    );
  }

  @Delete(':id')
  async deleteUser(
    @Param('id') id: string,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    const handler = nestJsRouteHandlerBuilder<
      undefined,
      [IUseCaseInlineFunc<undefined, undefined, boolean>]
    >(
      {
        initialQueryReflector: {
          entityId: "$['pathParameters']['id']",
        },
        handlers: [
          (query) => ({
            execute: () => this.deleteUserUseCase.execute(query),
          }),
        ],
        errorToStatusCodeMapping: {
          404: [Error],
        },
      },
      {
        allowedMethods: DEFAULT_ALLOWED_METHODS,
      },
    );

    return handler(
      {
        params: { id },
        headers: {},
        method: 'DELETE',
      },
      res,
      next,
    );
  }
}
