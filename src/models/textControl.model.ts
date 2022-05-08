import { getModelForClass, prop } from "@typegoose/typegoose";

export class TextControl {
  @prop({ Type: String })
  public button!: string;

  @prop({ Type: String })
  public textDescription!: string;

  @prop({ Type: Boolean })
  public status!: boolean;
}

export const TextControlModel = getModelForClass(TextControl, {
  schemaOptions: { collection: "cltTextControl" },
});
