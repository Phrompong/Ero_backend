import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { BaseModel } from "./base.model";
import { CustomerStock } from "./customer.stock.model";

export class MasterCustomer extends BaseModel {
  @prop({ type: String })
  public id!: string;

  @prop({ type: String })
  public name!: string;

  @prop({ type: String })
  public lastname!: string;

  @prop({ type: String })
  public nationalId!: string;

  @prop({ type: String })
  public telephone!: string;

  @prop({ type: String })
  public atsBank!: string;

  @prop({ type: String })
  public atsBankNo!: string;

  @prop({ type: String })
  public email!: string;

  @prop({ ref: () => CustomerStock })
  public customerStock!: Ref<CustomerStock>;
}

export const MasterCustomerModel = getModelForClass(MasterCustomer, {
  schemaOptions: { collection: "cltMasterCustomer" },
});
