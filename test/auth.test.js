const axios = require("axios");
const url = `http://localhost:${process.env.PORT}`;
import { UserModel } from "../src/models/users.model";
import { MasterCustomerModel } from "../src/models/master.customer.model";
import md5 from "md5";
const { expect } = require("chai");
const mongoose = require("mongoose");

describe("Service function test auth", () => {
  const instance = axios.create({
    baseURL: url,
    timeout: 1500,
    headers: {
      "Content-Type": "application/json",
    },
  });

  before(async () => {
    await UserModel.create({
      username: "admin",
      password: md5("1234"),
    });

    await MasterCustomerModel.create({
      _id: mongoose.Types.ObjectId("628ce70a972413889d194310"),
      refNo: "0107557000462",
      taxId: "0107557000462",
      __v: 0,
      account: "",
      address: "549/1 ถนนสรรพาวุธ แขวงบางนา เขตบางนา กรุงเทพมหานคร",
      atsBank: "",
      atsBankNo: "",
      bankCode: "",
      createdBy: "Import excel",
      createdOn: "2022-05-24T14:09:14.545Z",
      email: "wassana@comseven.com",
      fax: "020177555",
      holderType: 0,
      home: "",
      lastname: "คอมเซเว่น จำกัด (มหาชน)",
      name: "",
      nationalityCode: "000",
      no: 6143,
      occupationCode: "620",
      office: "020177777",
      taxRate: "0",
      telephone: "0959497418",
      title: "บริษัท",
      titleCode: "001",
      zipcode: "10260",
    });
  });

  after(async () => {
    await UserModel.deleteMany({});
    await MasterCustomerModel.deleteMany({});
  });

  it("it shoul able to signIn for admin", async () => {
    const body = {
      username: "admin",
      password: "1234",
    };

    const { data } = await instance.post(`/api/v1/auth/signIn`, body);

    expect(data).to.haveOwnProperty("code", "ERO-0001");
    expect(data).to.haveOwnProperty("message", "Sigin success");
  });

  it("it should able to signIn for customer", async () => {
    const body = {
      nationalId: "0107557000462",
    };

    const { data } = await instance.post(
      `/api/v1/auth/signIn?type=customer`,
      body
    );

    expect(data).to.haveOwnProperty("code", "ERO-0001");
    expect(data).to.haveOwnProperty("message", "Sigin success");
  });
});
