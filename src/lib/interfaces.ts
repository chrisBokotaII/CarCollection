export interface Ipayload {
  id: string;
}

export type IUser = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface Icar {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  fuel: string;
  transmission: string;
  price: number;
  color: string;
  mileage: number;
  description: string;
  image: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
