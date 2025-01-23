import { Injectable } from '@nestjs/common';
import { IQueryType, IUseCase } from '@denis_bruns/core';
import { IUser, UpdateUserDto } from '../interfaces/user.interface';
import { from, Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { MongoDBService } from '../../../database/mongodb.service';
import { ObjectId } from 'mongodb';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UpdateUserUseCase implements IUseCase<UpdateUserDto, IUser> {
  constructor(private readonly mongoDBService: MongoDBService) {}

  execute(query: IQueryType<UpdateUserDto>): Observable<IUser> {
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

    return from(collection.findOne({ _id: objectId })).pipe(
      switchMap((existingUser) => {
        if (!existingUser) {
          throw new Error('User not found');
        }

        return from(this.prepareUpdate(query.data)).pipe(
          switchMap((updateData) => {
            return from(
              collection.findOneAndUpdate(
                { _id: objectId },
                { $set: { ...updateData, updatedAt: new Date() } },
                {
                  returnDocument: 'after',
                },
              ),
            );
          }),
        );
      }),
      map((result) => {
        const updatedUser = result;
        if (!updatedUser) {
          throw new Error('User not found after update');
        }

        const sanitized = this.sanitizeUser(updatedUser);
        return sanitized;
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }

  private async prepareUpdate(
    data: UpdateUserDto,
  ): Promise<Partial<UpdateUserDto>> {
    if (data.password) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      return { ...data, password: hashedPassword };
    }
    return data;
  }

  private sanitizeUser(user: any): IUser {
    if (user._id) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, password, ...rest } = user;
      return {
        id: _id.toString(),
        ...rest,
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = user;
    return rest as IUser;
  }
}
