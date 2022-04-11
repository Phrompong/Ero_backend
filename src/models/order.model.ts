import { prop, getModelForClass, Ref } from "@typegoose/typegoose";
import { BaseModel } from "./base.model";

enum Status {
  confirmPayment,
  confirmOverPayment,
  waitProofTransfer,
  pendingTransfer,
}

export class Order extends BaseModel {
  @prop({ type: String })
  public firstname!: string;

  @prop({ type: String })
  public lastname!: string;

  @prop({ type: String })
  public detail!: string;

  @prop({ type: Number })
  public volume!: number;

  @prop({ type: String })
  public additional!: string;

  @prop({ type: Number })
  public value!: number;

  @prop({ type: String })
  public telephone!: string;

  @prop({ type: String })
  public email!: string;

  @prop({ type: String })
  public atsNumber!: string;

  @prop({ type: String })
  public bankAts!: string;

  @prop({ enum: Status, type: String })
  public status!: Status;
}

export const OrderModel = getModelForClass(Order, {
  schemaOptions: { collection: "cltOrders" },
});
