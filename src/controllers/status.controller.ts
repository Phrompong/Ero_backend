import { mongoose } from "@typegoose/typegoose";
import { StatusModel } from "../models/status.model";

export const statusData = [
  {
    _id: mongoose.Types.ObjectId("62592501d017af7548e56f31"),
    status: "ยืนยันการชำระเงิน",
    value: 1,
  },
  {
    _id: mongoose.Types.ObjectId("62592501d017af7548e56f32"),
    status: "รอหลักฐานการโอนเงิน",
    value: 2,
  },
  {
    _id: mongoose.Types.ObjectId("62592501d017af7548e56f33"),
    status: "ยืนยันการชำระเงินเกินสิทธิ",
    value: 3,
  },
  {
    _id: mongoose.Types.ObjectId("62592501d017af7548e56f34"),
    status: "รอดำเนินการโอนเงินคืน",
    value: 4,
  },
  {
    _id: mongoose.Types.ObjectId("62592501d017af7548e56f35"),
    status: "รอยืนยันการชำระเงิน",
    value: 5,
  },
];

export async function insertStatus() {
  const status = await StatusModel.find().lean();

  if (status.length > 0) return;

  await StatusModel.insertMany(statusData);
}
