import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { BaseModel } from "./base.model";
import { MasterCustomer } from "./master.customer.model";

export class CustomerStock extends BaseModel {
  @prop({ type: String })
  public id!: string;

  @prop({ type: String })
  public rightStockName!: string;

  @prop({ type: Number })
  public offerPrice!: number;

  @prop({ type: String })
  public rightSpecialName!: string;

  @prop({ type: Number })
  public stockVolume!: Number;

  @prop({ type: Number })
  public rightStockVolume!: Number;

  @prop({ type: Number })
  public rightSpecialVolume!: Number;

  @prop({ type: Boolean })
  public isActive!: boolean;

  @prop({ type: String })
  public registrationNo!: string;

  @prop({ ref: () => MasterCustomer })
  public customerId!: Ref<MasterCustomer>;
}

export const CustomerStockModel = getModelForClass(CustomerStock, {
  schemaOptions: { collection: "cltCustomerStock" },
});
