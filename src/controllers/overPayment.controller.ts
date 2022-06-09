import { CustomerStock } from "../models/customer.stock.model";
import { MasterCustomer } from "../models/master.customer.model";
import { OrderModel } from "../models/order.model";

// * Step 1 process userRight
export async function userRight() {
  // * Sum value total stock volume
  const totalStockVolumes: number = await getTotalStockVolume();

  // * Get order
  const orders = await OrderModel.aggregate([
    {
      $lookup: {
        from: "cltMasterCustomer",
        localField: "customerId",
        foreignField: "_id",
        as: "customerId",
      },
    },
    {
      $unwind: {
        path: "$customerId",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "cltCustomerStock",
        localField: "customerStockId",
        foreignField: "_id",
        as: "customerStockId",
      },
    },
    {
      $unwind: {
        path: "$customerStockId",
        preserveNullAndEmptyArrays: true,
      },
    },
  ]);

  let response: any[] = [];

  for (const order of orders) {
    const { customerId, customerStockId, paidRightVolume } = order;
    const { stockVolume, ratio, getRight } = customerStockId as CustomerStock;
    const { name, lastname } = customerId as MasterCustomer;

    const proportion = (+stockVolume / totalStockVolumes) * 100;
    const rightVolume = (+stockVolume * ratio) / getRight;

    let lessThanRight = 0;
    if (rightVolume < rightVolume) {
      lessThanRight = paidRightVolume;
    }

    let equalRight = 0;
    let moreThanRight = 0;
    if (paidRightVolume >= rightVolume) {
      equalRight = rightVolume;
      moreThanRight = paidRightVolume - rightVolume;
    }

    response.push({
      orderId: order._id,
      customerId: customerId._id,
      name: `${name} ${lastname}`, // * รายชื่อผู้ถือหุ้น
      stockVolume, // * สัญชาติ
      proportion, // * จำนวน
      rightVolume, // * สิทธิที่จองได้
      reserve: {
        paidRightVolume, // * จำนวนที่จอง
        lessThanRight, // * น้อยกว่า
        equalRight, // * ตามสิทธิ์
        moreThanRight, // * เกิดสิทธิ์
        sum: paidRightVolume ? paidRightVolume : equalRight + moreThanRight, // * รวม
      },
      allocateRight: lessThanRight || equalRight,
    });
  }

  return response;
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