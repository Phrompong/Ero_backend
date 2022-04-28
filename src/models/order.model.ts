import { prop, getModelForClass, Ref } from "@typegoose/typegoose";
import { BaseModel } from "./base.model";
import { MasterCustomer } from "./master.customer.model";
import { Status } from "./status.model";

export class Address {
  @prop({ type: String })
  public name!: string;

  @prop({ type: String })
  public houseNo!: string;

  @prop({ type: String })
  public district!: string;

  @prop({ type: String })
  public province!: string;

  @prop({ type: String })
  public zipcode!: string;

  @prop({ type: String })
  public tel!: string;
}

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

  @prop({ type: Number })
  public excessAmount!: Number;

  @prop({ type: String })
  public customerName!: string;

  @prop({ type: String })
  public customerTel!: string;

  @prop({ type: String })
  public brokerId!: string;

  @prop({ type: String })
  public accountNo!: string;

  @prop({ type: String })
  public customerStockId!: string;

  @prop({ _id: false, type: Address })
  public address!: Address;

  @prop({ type: String })
  public registrationNo!: string;
}

export const OrderModel = getModelForClass(Order, {
  schemaOptions: { collection: "cltOrders" },
});
