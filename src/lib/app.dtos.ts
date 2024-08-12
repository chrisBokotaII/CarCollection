import { Icar, IUser } from "./interfaces";

export class CarDto {
  car: Icar;
  owner: IUser;
}

export class usersDto {
  user: IUser[];
}
