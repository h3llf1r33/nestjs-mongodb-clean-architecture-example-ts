export interface IUser {
  id: string;
  email: string;
  name: string;
  isVerified: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
  password?: string;
  isVerified?: boolean;
}

export interface IUserWithPassword {
  id: string;
  email: string;
  name: string;
  password: string;
  isVerified: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser extends Omit<IUserWithPassword, 'password'> {
  id: string;
  email: string;
  name: string;
  isVerified: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}
