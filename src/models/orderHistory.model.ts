import { prop, getModelForClass, Ref, mongoose } from "@typegoose/typegoose";
import { BaseModel } from "./base.model";
import { CustomerStock } from "./customer.stock.model";
import { MasterBank } from "./master.bank.model";
import { MasterBroker } from "./master.broker.model";
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

export class OrderHistory extends BaseModel {
  @prop({ ref: () => MasterCustomer })
  public customerId!: Ref<MasterCustomer>;

  @prop({ type: String })
  public rightStockName!: string;

  @prop({ type: Number })
  public stockVolume!: number;

  @prop({ type: String })
  public rightSpecialName!: string;

  @prop({ type: Number })
  public rightSpecialVolume!: number;

  @prop({ type: Number })
  public paidRightVolume!: number;

  @prop({ type: Number })
  public paidSpecialVolume!: number;

  @prop({ type: Number })
  public paymentAmount!: number;

  @prop({ type: Number })
  public returnAmount!: number;

  @prop({ type: Date })
  public attachedOn?: Date;

  @prop({ type: String })
  public attachedFile?: String;

  @prop({ type: Date })
  public attachedBookBankOn?: Date;

  @prop({ type: String })
  public attachedFileBookBank?: String;

  @prop({ ref: () => Status })
  public status!: Ref<Status>;

  @prop({ type: Number })
  public excessAmount!: Number;

  @prop({ type: String })
  public customerName!: string;

  @prop({ type: String })
  public customerTel!: string;

  @prop({ ref: () => MasterBroker })
  public brokerId!: Ref<MasterBroker>;

  @prop({ type: String })
  public accountNo!: string;

  @prop({ ref: () => CustomerStock })
  public customerStockId!: Ref<CustomerStock>;

  @prop({ type: String })
  public address!: string;

  @prop({ type: String })
  public registrationNo!: string;

  @prop({ type: mongoose.Types.ObjectId })
  public bankRefund?: mongoose.Types.ObjectId;

  @prop({ type: String })
  public bankRefundNo!: string;

  @prop({ type: Date })
  public paymentDate!: Date;

  @prop({ type: Boolean })
  public isCheck?: boolean;
}

export const OrderHistoryModel = getModelForClass(OrderHistory, {
  schemaOptions: { collection: "cltOrderHistory" },
});
