import { Order } from "@/models/Order";
import { User } from "./user";

export type ResponseOrderDto = {
  Order: Order;
  User: User;
};
