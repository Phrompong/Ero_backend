import * as jwt from "jsonwebtoken";
import { Auth, AuthModel } from "../models/auth.model";
import { MasterCustomerModel } from "../models/master.customer.model";
import jwt_decode from "jwt-decode";
import md5 from "md5";

export async function adminSignIn(username: string, password: string) {
  const users = await MasterCustomerModel.find({
    username,
    password: md5(password.trim()),
  }).lean();

  if (users.length === 0) return "";

  return {
    userId: users[0]._id,
  };
}

export async function customerSignIn(nationalId: string): Promise<any> {
  const masterCustomer = await MasterCustomerModel.find({ nationalId }).lean();

  if (masterCustomer.length === 0) {
    return "";
  }

  return {
    token: createJwtToken(nationalId, masterCustomer[0]._id),
    customerId: masterCustomer[0]._id,
  };
}

export async function getToken(key: string): Promise<string> {
  const auth = await AuthModel.findOne({ key }).lean();

  if (!auth) {
    return "";
  }

  return auth.jwt;
}

function createJwtToken(key: string, customerId: string): string {
  return jwt.sign({ key, customerId }, "test", {
    expiresIn: "1800s",
  });
}

export function decodeJwtToken(token: string): any {
  return jwt_decode(token);
}
