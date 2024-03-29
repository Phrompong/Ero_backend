import { MasterBank } from "models/master.bank.model";
import {
  CustomerStock,
  CustomerStockModel,
} from "../models/customer.stock.model";
import { MasterCustomer } from "../models/master.customer.model";
import { OrderModel } from "../models/order.model";

export async function getOverPaymet() {
  const resultUerRight = await userRight();

  const resultRatio = await findRatio(resultUerRight);

  const resultCalculate = await calculate(resultRatio);

  return resultCalculate;
}

// * Step 1 process userRight
async function userRight() {
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
    {
      $lookup: {
        from: "cltMasterBanks",
        localField: "bankRefund",
        foreignField: "_id",
        as: "bankRefund",
      },
    },
    {
      $unwind: {
        path: "$bankRefund",
        preserveNullAndEmptyArrays: true,
      },
    },
  ]);

  let response: any[] = [];

  for (const order of orders) {
    const {
      customerId,
      customerStockId,
      paidRightVolume,
      bankRefund,
      bankRefundNo,
      excessAmount,
    } = order;
    const { stockVolume, ratio, getRight, offerPrice, registrationNo } =
      (customerStockId as CustomerStock) || {};
    const { name, lastname, nationalityCode } = customerId as MasterCustomer;
    const { nameTH } = (bankRefund as MasterBank) || {};

    const proportion = (+stockVolume / totalStockVolumes) * 100;
    const rightVolume = (+stockVolume * ratio) / getRight;

    let lessThanRight = 0;
    if (paidRightVolume < rightVolume) {
      lessThanRight = paidRightVolume;
    }

    let equalRight = 0;
    let moreThanRight = 0;
    if (paidRightVolume >= rightVolume) {
      equalRight = rightVolume;
      moreThanRight = Math.floor(paidRightVolume - rightVolume);
    }

    response.push({
      orderId: order._id.toString(),
      customerId: customerId._id.toString(),
      firstname: name, // * รายชื่อผู้ถือหุ้น
      lastname: lastname,
      nationalityCode, // * สัญชาติ
      stockVolume, // * จำนวนหุ้นเดิม
      proportion, // * สัดส่วน
      rightVolume, // * สิทธิที่จองได้
      reserve: {
        paidRightVolume, // * จำนวนที่จอง
        lessThanRight, // * น้อยกว่า
        equalRight, // * ตามสิทธิ์
        moreThanRight, // * เกินสิทธิ์
        //sum: paidRightVolume ? paidRightVolume : equalRight + moreThanRight, // * รวม
        allocateRight: lessThanRight || equalRight, // * จัดสรรตามสิทธิที่ได้
      },
      bankRefund: nameTH,
      bankRefundNo,
      offerPrice,
      bookRight: excessAmount / offerPrice - paidRightVolume,
      registrationNo,
      excessAmount,
      allocateRight: lessThanRight || equalRight, // * จัดสรรตามสิทธิที่ได้
      lessThanRight, // * น้อยกว่า
      equalRight, // * ตามสิทธิ์
      moreThanRight, // * เกินสิทธิ์
      paidRightVolume, // * สิทธิที่จองได้
    });
  }

  return response;
}

// * Step 2 find ratio
async function findRatio(userRights: any[]) {
  let response: any[] = [];

  for (const userRight of userRights) {
    const { proportion, reserve } = userRight;

    const {
      lessThanRight, // * น้อยกว่า
      equalRight, // * ตามสิทธิ์
      moreThanRight, // * เกินสิทธิ์,
    } = reserve;

    const ratio = moreThanRight === 0 ? lessThanRight : proportion;

    response.push({ ...userRight, ratio });
  }

  return response;
}

// * Step 3
async function calculate(userRights: any[]) {
  let sumAllowcateRight = 0;
  let totalStockVolume = 0;
  let countPersionOverVolume = 0;

  userRights.filter((item) => {
    const { rightVolume, reserve } = item;
    totalStockVolume += +rightVolume;
    sumAllowcateRight += reserve.allocateRight;

    if (reserve.moreThanRight) {
      countPersionOverVolume += 1;
    }
  });

  let volumeOver = totalStockVolume - sumAllowcateRight;

  let response: any[] = [];

  while (volumeOver > 0) {
    // * เชคว่าคนที่จองสิทธิ์ได้หุ้นครบแล้ว
    const countComplete = userRights.filter((o) => {
      return o.status === true;
    }).length;

    if (countComplete == countPersionOverVolume) break;

    for (const userRight of userRights) {
      const { orderId, reserve, status } = userRight;
      if (!status) {
        const { moreThanRight } = reserve;

        if (moreThanRight) {
          let { ratio, volume, status } = userRight;

          if (!volume) {
            volume = 0;
          }

          volume = volume + (ratio / 100) * volumeOver;

          // * เชคว่าได้หุ้นครบแล้วหรือยัง
          if (volume >= moreThanRight) {
            volume = moreThanRight;
            status = true;
          }

          volumeOver = Math.floor(volumeOver - volume);

          // * แก้ไขข้อมูล
          const findindex = await userRights.findIndex(
            (o) => o.orderId === orderId
          );

          userRights[findindex] = {
            ...userRight,
            volume: volume < 0 ? -volume : volume,
            status,
          };

          //response.push({ ...userRight, volume, status });
        }
      }
    }
  }

  userRights.map((o) => {
    const { volume, reserve, offerPrice, equalRight, rightVolume } = o;
    const {
      moreThanRight, // * เกินสิทธิ์,
    } = reserve;

    let notAllocate = 0; // * จำนวนหุ้นที่ไม่ได้รับการจัดสรร
    if (!volume) {
      notAllocate = 0;
    } else {
      notAllocate = Math.floor(moreThanRight - volume);
    }

    o.volume = o.volume ? Math.floor(o.volume) : 0;
    o.notAllocate = Math.floor(notAllocate);
    o.refundAmount = notAllocate * offerPrice;
    o.moreThanRight = moreThanRight;
    o.wollance = volume ? Math.floor((equalRight + volume) / 2) : 0;
    o.actual = volume ? Math.floor(rightVolume + volume) : 0;

    return o;
  });

  return userRights;
}

async function getTotalStockVolume(): Promise<number> {
  const results = await CustomerStockModel.aggregate([
    {
      $project: {
        _id: 0,
        rightStockName: 1,
        rightStockVolume: { $toDecimal: "$rightStockVolume" },
      },
    },
    {
      $facet: {
        count: [
          {
            $count: "rightStockName",
          },
        ],
        total: [
          {
            $group: {
              _id: "$rightStockName",
              sum: {
                $sum: "$rightStockVolume",
              },
            },
          },
        ],
      },
    },
  ]);

  if (results.length === 0) return 0;

  const { count, total } = results[0];

  return total.length > 0 ? +total[0].sum : 0;
}
