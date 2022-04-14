import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { BaseModel } from "./base.model";
import { MasterCustomer } from "./customer.model";

export class CustomerStock extends BaseModel {
  @prop({ type: String })
  public id!: string;

  @prop({ ref: () => MasterCustomer })
  public customerId!: Ref<MasterCustomer>;

  @prop({ type: String })
  public rightStockName!: string;

  @prop({ type: String })
  public rightSpecialName!: string;

  @prop({ type: Number })
  public stockVolume!: Number;

  @prop({ type: Number })
  public rightStockVolume!: Number;

  @prop({ type: Number })
  public rightSpecialVolume!: Number;
}

export const CustomerStockModel = getModelForClass(CustomerStock, {
  schemaOptions: { collection: "cltCustomerStock" },
});
