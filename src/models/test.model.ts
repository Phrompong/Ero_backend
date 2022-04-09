import { prop, getModelForClass, Ref } from "@typegoose/typegoose";

export class Test {
  @prop({ type: String })
  public firstname!: string;

  @prop({ type: String })
  public lastname!: string;
}

export const TestModel = getModelForClass(Test, {
  schemaOptions: { collection: "cltTest" },
});
