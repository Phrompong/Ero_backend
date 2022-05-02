import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { BaseModel } from "./base.model";
import { MasterCustomer, MasterCustomerModel } from "./master.customer.model";

export class ConsentHistory extends BaseModel {
  @prop({ ref: () => MasterCustomerModel })
  public customerId!: Ref<MasterCustomer>;

  @prop({ type: Boolean })
  public isAccept!: Ref<Boolean>;
}

export const ConsentHistoryModel = getModelForClass(ConsentHistory, {
  schemaOptions: { collection: "cltConsentHistories" },
});
