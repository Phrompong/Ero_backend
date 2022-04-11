import { prop } from "@typegoose/typegoose";

export class BaseModel {
  @prop({ type: Date })
  public createdOn!: Date;

  @prop({ type: String })
  public createdBy!: string;

  @prop({ type: Date })
  public updatedOn!: Date;

  @prop({ type: String })
  public updatedBy!: string;
}
