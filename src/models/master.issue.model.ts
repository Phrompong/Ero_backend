import { getModelForClass, prop } from "@typegoose/typegoose";
import { BaseModel } from "./base.model";

export class MasterIssue extends BaseModel {
  @prop()
  public nameTH!: string;

  @prop()
  public nameEN!: string;

  @prop()
  public isActive!: boolean;
}

export const MasterIssueModel = getModelForClass(MasterIssue, {
  schemaOptions: { collection: "cltMasterIssues" },
});
