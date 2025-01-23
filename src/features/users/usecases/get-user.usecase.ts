import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { IQueryType, IUseCase } from '@denis_bruns/core';
import { from, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MongoDBService } from '../../../database/mongodb.service';
import { IUser } from '../interfaces/user.interface';

@Injectable()
export class GetUserUseCase implements IUseCase<undefined, IUser> {
  constructor(private readonly mongoDBService: MongoDBService) {}

  execute(query: IQueryType<undefined>): Observable<IUser> {
    if (!query?.entityId) {
      return throwError(() => new Error('Missing user ID'));
    }

    const collection = this.mongoDBService.getCollection('users');

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(query.entityId);
    } catch {
      return throwError(() => new Error('Invalid user ID format'));
    }

    return from(collection.findOne({ _id: objectId })).pipe(
      map((result) => {
        if (!result) {
          throw new Error('User not found');
        }
        return this.sanitizeUser(result);
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }

  private sanitizeUser(user: any): IUser {
    if (!user._id) {
      throw new Error('Invalid user data: missing _id');
    }

    const { _id, ...rest } = user;
    return {
      id: _id.toString(),
      ...rest,
    };
  }
}
