import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import * as dotenv from "dotenv";
import path = require("path");
import { Cars } from "./entity/Cars";
dotenv.config();
const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME, ENVIRONMENT } =
  process.env;
export const AppDataSource = new DataSource({
  type: "postgres",
  host: DB_HOST,
  port: parseInt(DB_PORT),
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  synchronize: ENVIRONMENT === "development" ? true : false,
  logging: ENVIRONMENT === "development" ? true : false,
  entities: [User, Cars],
  migrations: [],
  subscribers: [],
});
