import { getModelForClass, prop } from "@typegoose/typegoose";
import { BaseModel } from "./base.model";

export class MasterBank extends BaseModel {
  @prop({ type: String })
  public nameTH!: string;

  @prop({ type: String })
  public nameEN!: string;

  @prop({ type: Number })
  public ref1!: number;

  @prop({ type: Number })
  public ref2!: number;

  @prop({ type: String })
  public logo!: string;

  @prop({ type: String })
  public qrCode!: string;

  @prop({ type: Boolean })
  public isActive!: boolean;
}

export const MasterBankModel = getModelForClass(MasterBank, {
  schemaOptions: { collection: "cltMasterBanks" },
});
