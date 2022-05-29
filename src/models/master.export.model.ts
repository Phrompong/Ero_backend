import { getModelForClass, prop } from "@typegoose/typegoose";
import { BaseModel } from "./base.model";

export class MasterExport extends BaseModel {
  @prop()
  public name!: string;

  @prop()
  public value!: string;

  @prop()
  public fileExtension!: string;
}

export const MasterExportModel = getModelForClass(MasterExport, {
  schemaOptions: { collection: "cltMasterExports" },
});
