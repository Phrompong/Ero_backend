import { prop, getModelForClass, Ref } from "@typegoose/typegoose";
import { BaseModel } from "./base.model";
import { MasterCustomer } from "./master.customer.model";
import { Status } from "./status.model";

export class Order extends BaseModel {
  @prop({ ref: () => MasterCustomer })
  public customerId!: Ref<MasterCustomer>;

  @prop({ type: String })
  public rightStockName!: string;

  @prop({ type: Number })
  public stockVolume!: number;

  @prop({ type: String })
  public rightSpacialName!: string;

  @prop({ type: Number })
  public rightSpacialVolume!: number;

  @prop({ type: Number })
  public paidRightVolume!: number;

  @prop({ type: Number })
  public paidSpacialVolume!: number;

  @prop({ type: Number })
  public paymentAmount!: number;

  @prop({ type: Number })
  public returnAmount!: number;

  @prop({ type: Date })
  public attachedOn?: Date;

  @prop({ type: String })
  public attachedFile?: String;

  @prop({ ref: () => Status })
  public status!: Ref<Status>;
}

export const OrderModel = getModelForClass(Order, {
  schemaOptions: { collection: "cltOrders" },
});
