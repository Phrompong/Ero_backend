import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { BaseModel } from "./base.model";
import { MasterCustomer } from "./master.customer.model";

export class CustomerStock extends BaseModel {
  @prop({ type: String })
  public rightStockName!: string; // * Securities Name

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
  public registrationNo!: string; // * Holder ID

  @prop({ ref: () => MasterCustomer })
  public customerId!: Ref<MasterCustomer>;

  @prop({ type: String })
  public company!: string;

  @prop({ type: String })
  public detailShort!: string;

  @prop({ type: String })
  public detailFull!: string;

  @prop({ type: Number })
  public ratio!: number;

  @prop({ type: Number })
  public getRight!: number;

  // * New 13/05/65
  @prop({ type: String })
  public withHoldingTaxType!: string;

  @prop({ type: String })
  public taxRate!: string;

  @prop({ type: String })
  public partiNo!: string;

  @prop({ type: String })
  public refType!: string;

  @prop({ type: String })
  public eligibleSecurities!: string;

  @prop({ type: Number })
  public noForCalculation!: number;

  @prop({ type: String })
  public noSubAllocate!: string;

  @prop({ type: String })
  public brokerateAccount!: string;

  @prop({ type: String })
  public partiNo2!: string;
}

export const CustomerStockModel = getModelForClass(CustomerStock, {
  schemaOptions: { collection: "cltCustomerStock" },
});
