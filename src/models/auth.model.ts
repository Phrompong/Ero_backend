import { prop, getModelForClass, Ref } from "@typegoose/typegoose";

export class auth {
  @prop({ type: String })
  public key!: string;

  @prop({ type: String })
  public jwt!: string;
}

export const AuthModel = getModelForClass(auth, {
  schemaOptions: { collection: "cltAuth" },
});
