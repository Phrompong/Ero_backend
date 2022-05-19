import { getModelForClass, prop } from "@typegoose/typegoose";
import { BaseModel } from "./base.model";

export class MasterBroker extends BaseModel {
  @prop({ type: String })
  public code!: string;

  @prop({ type: String })
  public name!: string;

  @prop({ type: String })
  public nameEN!: string;

  @prop({ type: Boolean })
  public status!: boolean;
}

export const MasterBrokerModel = getModelForClass(MasterBroker, {
  schemaOptions: { collection: "cltMasterBrokers" },
});
