import { getModelForClass, mongoose, prop, Ref } from "@typegoose/typegoose";
import { BaseModel } from "./base.model";
import { CustomerStock } from "./customer.stock.model";

export class MasterCustomer extends BaseModel {
  @prop()
  public _id?: mongoose.Types.ObjectId;

  @prop({ type: String })
  public name!: string;

  @prop({ type: String })
  public lastname!: string;

  @prop({ type: String, index: true })
  public nationalId?: string;

  @prop({ type: String })
  public telephone!: string;

  @prop({ type: String })
  public atsBank!: string;

  @prop({ type: String })
  public atsBankNo!: string;

  @prop({ type: String })
  public email!: string;

  @prop({ type: String })
  public address!: string;

  @prop({ type: String })
  public zipcode!: string;

  @prop({ type: String, index: true })
  public taxId!: string;

  @prop({ type: String })
  public taxRate!: string;

  // * New 13/05/65
  @prop({ type: Number })
  public no!: string;

  @prop({ type: Number })
  public holderType!: string;

  @prop({ type: String })
  public titleCode!: string;

  @prop({ type: String })
  public title!: string;

  @prop({ type: String })
  public home!: string;

  @prop({ type: String })
  public office!: string;

  @prop({ type: String })
  public nationalityCode!: string;

  @prop({ type: String })
  public occupationCode!: string;

  @prop({ type: String })
  public bankCode!: string;

  @prop({ type: String })
  public account!: string;

  @prop({ type: String })
  public fax!: string;

  @prop({ type: String })
  public refNo!: string;

  @prop({ type: String })
  public r!: string;
}

export const MasterCustomerModel = getModelForClass(MasterCustomer, {
  schemaOptions: { collection: "cltMasterCustomer" },
});
