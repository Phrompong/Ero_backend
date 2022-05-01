import { getModelForClass, prop } from "@typegoose/typegoose";
import { BaseModel } from "./base.model";

export class CustomerService extends BaseModel {
  @prop()
  public email!: string;

  @prop()
  public subject!: string;

  @prop()
  public issue!: string;

  @prop()
  public specifyIssue!: string;
}

export const CustomerServiceModel = getModelForClass(CustomerService, {
  schemaOptions: { collection: "cltCustomerServices" },
});
