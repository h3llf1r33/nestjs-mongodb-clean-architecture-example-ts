import { Injectable } from '@nestjs/common';
import { from, Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {
  CreateUserDto,
  IUser,
  IUserWithPassword,
} from '../interfaces/user.interface';
import * as bcrypt from 'bcrypt';
import { IQueryType, IUseCase } from '@denis_bruns/core';
import { MongoDBService } from '../../../database/mongodb.service';
import { fetchWithFiltersAndPaginationMongoDb } from '@denis_bruns/nosql-mongodb';

@Injectable()
export class CreateUserUseCase implements IUseCase<CreateUserDto, IUser> {
  constructor(private readonly mongoDBService: MongoDBService) {}

  execute(query: IQueryType<CreateUserDto>): Observable<IUser> {
    const collection = this.mongoDBService.getCollection('users');
    return from(this.checkExistingUser(query.data.email)).pipe(
      switchMap((exists) => {
        if (exists) {
          return throwError(() => new Error('User already exists'));
        }
        return from(bcrypt.hash(query.data.password, 10));
      }),
      switchMap((hashedPassword) => {
        const userData = {
          ...query.data,
          password: hashedPassword,
          isVerified: false,
          lastLogin: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        return from(collection.insertOne(userData));
      }),
      map((result) => ({
        id: result.insertedId.toString(),
        ...query.data,
        isVerified: false,
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      map((user) => this.sanitizeUser(user)),
      catchError((error) => throwError(() => error)),
    );
  }

  private async checkExistingUser(email: string): Promise<boolean> {
    const collection = this.mongoDBService.getCollection('users');
    const response =
      await fetchWithFiltersAndPaginationMongoDb<IUserWithPassword>(
        'users',
        {
          filters: [
            {
              field: 'email',
              operator: '=',
              value: email,
            },
          ],
          pagination: { limit: 1 },
        },
        collection,
      );
    return response.data.length > 0;
  }

  private sanitizeUser(user: IUserWithPassword): IUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isVerified: user.isVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
