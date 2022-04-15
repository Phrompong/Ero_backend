import { mongoose } from "@typegoose/typegoose";

class Resource {
  public path?: string;

  public rootId?: mongoose.Types.ObjectId;
}

export class DataWithPaging {
  public filter?: unknown;

  public page?: number;

  public limit?: number;

  public sort?: string;

  public model!: any;

  public project?: any;

  public resource?: Resource;
}
