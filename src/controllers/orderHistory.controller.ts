import { OrderHistory, OrderHistoryModel } from "../models/orderHistory.model";

export async function create(orderHistory: OrderHistory) {
  const result = await OrderHistoryModel.create(orderHistory);

  return result;
}

export async function getAll() {
  const result = await OrderHistoryModel.find().lean();

  return result;
}

export async function getById(id: string) {
  const result = await OrderHistoryModel.findById(id).lean();

  return result;
}
