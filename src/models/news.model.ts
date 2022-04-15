import { prop, getModelForClass, Ref } from "@typegoose/typegoose";

export class News {
  @prop({ type: String })
  public newsUrl!: string;

  @prop({ type: Boolean })
  public isActive!: Boolean;
}

export const NewsModel = getModelForClass(News, {
  schemaOptions: { collection: "cltNews" },
});
