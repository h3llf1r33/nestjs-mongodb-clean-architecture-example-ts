import { Injectable } from '@nestjs/common';
import { IQueryType, IUseCase } from '@denis_bruns/core';
import { from, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MongoDBService } from '../../../database/mongodb.service';
import { ObjectId } from 'mongodb';

@Injectable()
export class DeleteUserUseCase implements IUseCase<undefined, boolean> {
  constructor(private readonly mongoDBService: MongoDBService) {}

  execute(query: IQueryType<undefined>): Observable<boolean> {
    const collection = this.mongoDBService.getCollection('users');

    if (!query?.entityId) {
      return throwError(() => new Error('Missing user ID'));
    }

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(query.entityId);
    } catch {
      return throwError(() => new Error('Invalid user ID format'));
    }

    return from(collection.deleteOne({ _id: objectId })).pipe(
      map((result) => {
        if (result.deletedCount === 0) {
          throw new Error('User not found');
        }
        return true;
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }
}
