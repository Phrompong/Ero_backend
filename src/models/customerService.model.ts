import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { BaseModel } from "./base.model";
import { MasterIssue } from "./master.issue.model";

export class CustomerService extends BaseModel {
  @prop()
  public email!: string;

  @prop()
  public subject!: string;

  @prop({ ref: () => MasterIssue })
  public issue!: Ref<MasterIssue>;

  @prop()
  public specifyIssue!: string;
}

export const CustomerServiceModel = getModelForClass(CustomerService, {
  schemaOptions: { collection: "cltCustomerServices" },
});
