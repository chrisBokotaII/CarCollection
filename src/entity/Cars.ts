import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./User";
import { BaseClass } from "./BaseClass";

@Entity()
export class Cars extends BaseClass {
  @Column()
  name: string;

  @Column()
  brand: string;

  @Column()
  model: string;
  @Column()
  year: number;
  @Column()
  fuel: string;
  @Column()
  transmission: string;
  @Column()
  price: number;
  @Column()
  color: string;
  @Column()
  mileage: number;
  @Column()
  description: string;
  @Column()
  image: string;
  @Column()
  status: string;
  @ManyToOne(() => User, (user) => user.cars, {
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  })
  user: User;
}
