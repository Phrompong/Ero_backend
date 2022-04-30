import { getModelForClass, prop } from "@typegoose/typegoose";
import { BaseModel } from "./base.model";

enum BankType {
  payment,
  refund,
}

export class MasterBank extends BaseModel {
  @prop({ type: String })
  public nameTH!: string;

  @prop({ type: String })
  public nameEN!: string;

  @prop({ type: String })
  public accountName!: string;

  @prop({ type: String })
  public accountNumber!: string;

  @prop({ type: String })
  public branch!: string;

  @prop({ type: Number })
  public ref1!: number;

  @prop({ type: Number })
  public ref2!: number;

  @prop({ type: String })
  public logo!: string;

  @prop({ type: String })
  public qrCode!: string;

  @prop({ type: String })
  public shortName!: string;

  @prop({ type: Boolean })
  public isActive!: boolean;

  @prop({ type: String })
  public type!: string;
}

export const MasterBankModel = getModelForClass(MasterBank, {
  schemaOptions: { collection: "cltMasterBanks" },
});
