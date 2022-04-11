import { prop, getModelForClass, Ref } from "@typegoose/typegoose";

export class Auth {
  @prop({ type: String })
  public key!: string;

  @prop({ type: String })
  public jwt!: string;
}

export const AuthModel = getModelForClass(Auth, {
  schemaOptions: { collection: "cltAuth" },
});
