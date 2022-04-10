import { prop, getModelForClass, Ref } from "@typegoose/typegoose";
import { BaseModel } from "./base.model";

export class User extends BaseModel {
  @prop({ type: String })
  public username!: string;

  @prop({ type: String })
  public password!: string;
}

export const UserModel = getModelForClass(User, {
  schemaOptions: { collection: "cltUsers" },
});
