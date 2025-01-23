import { Injectable } from '@nestjs/common';
import {
  IPaginatedResponse,
  IQueryType,
  IUseCase,
} from '@denis_bruns/core';
import { fetchWithFiltersAndPaginationMongoDb } from '@denis_bruns/nosql-mongodb';
import { from, Observable, throwError } from 'rxjs';
import { IUser, IUserWithPassword } from '../interfaces/user.interface';
import { catchError, map } from 'rxjs/operators';
import { MongoDBService } from '../../../database/mongodb.service';

@Injectable()
export class ListUsersUseCase
  implements IUseCase<undefined, IPaginatedResponse<IUser>>
{
  constructor(private readonly mongoDBService: MongoDBService) {}

  execute(query: IQueryType<undefined>): Observable<IPaginatedResponse<IUser>> {
    const collection = this.mongoDBService.getCollection('users');

    const filterQuery = {
      filters: [],
      pagination: { page: 1, limit: 10 },
      ...query.filterQuery,
    };

    return from(
      fetchWithFiltersAndPaginationMongoDb<IUserWithPassword>(
        'users',
        filterQuery,
        collection,
        '_id', // Use _id as the primary key cause its mongo db
      ),
    ).pipe(
      map((response) => {
        return {
          data: response.data.map((user) => this.sanitizeUser(user)),
          total: response.total,
          page: response.page,
          limit: response.limit,
        };
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }

  private sanitizeUser(user: any): IUser {
    const { _id, id, ...rest } = user;
    return {
      id: (_id?.toString() || id || '').toString(),
      ...rest,
    };
  }
}
