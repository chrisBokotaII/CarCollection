import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Cars } from "./Cars";
import { BaseClass } from "./BaseClass";

@Entity()
export class User extends BaseClass {
  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;
  @Column({ unique: true })
  phone: string;
  @Column({ default: false })
  verified: boolean;
  @OneToMany(() => Cars, (cars) => cars.user)
  cars: Cars[];
}
