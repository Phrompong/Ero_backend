import { prop, getModelForClass, Ref } from "@typegoose/typegoose";
import { BaseModel } from "./base.model";
import { MasterCustomer } from "./master.customer.model";

export class Status extends BaseModel {
  @prop({ ref: () => String })
  public status!: string;
}

export const StatusModel = getModelForClass(Status, {
  schemaOptions: { collection: "cltStatus" },
});
