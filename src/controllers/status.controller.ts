import { mongoose } from "@typegoose/typegoose";
import { StatusModel } from "../models/status.model";

export const statusData = [
  {
    _id: mongoose.Types.ObjectId("62592501d017af7548e56f31"),
    status: "ยืนยันการชำระเงิน",
  },
  {
    _id: mongoose.Types.ObjectId("62592501d017af7548e56f32"),
    status: "รอหลักฐานการโอนเงิน",
  },
  {
    _id: mongoose.Types.ObjectId("62592501d017af7548e56f33"),
    status: "ยืนยันการชำระเงินเกินสิทธิ",
  },
  {
    _id: mongoose.Types.ObjectId("62592501d017af7548e56f34"),
    status: "รอดำเนินการโอนเงินคืน",
  },
  {
    _id: mongoose.Types.ObjectId("62592501d017af7548e56f35"),
    status: "รอยืนยันการชำระเงิน",
  },
];

export async function insertStatus() {
  const status = await StatusModel.find().lean();

  if (status.length > 0) return;

  await StatusModel.insertMany(statusData);
}
