import * as jwt from "jsonwebtoken";
import { MasterCustomerModel } from "../models/customer.model";

export async function admin(username: string, password: string) {}

export async function customerSignIn(nationalId: string): Promise<string> {
  const masterCustomer = await MasterCustomerModel.find({ nationalId }).lean();

  if (masterCustomer.length === 0) {
    return "";
  }

  return createJwtToken(nationalId);
}

function createJwtToken(key: string): string {
  return jwt.sign({ key }, "test", {
    expiresIn: "1800s",
  });
}
