import { OrderModel } from "../models/order.model";

// * Step 1 process userRight
export async function userRight() {
  // * Sum value total stock volume
  const totalStockVolume = await getTotalStockVolume();

  const response: any = {};
}

async function getTotalStockVolume(): Promise<number> {
  const response = await OrderModel.aggregate([
    {
      $group: {
        _id: "$rightStockName",
        totalStockVolume: {
          $sum: "$stockVolume",
        },
      },
    },
  ]);

  if (response.length === 0) return 0;

  return response[0].totalStockVolume;
}
