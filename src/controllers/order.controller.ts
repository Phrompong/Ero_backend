import { Order, OrderModel } from "../models/order.model";
import { getDataWithPaging } from "./common.controller";

export async function insert(order: Order) {
  if (!order) {
    return;
  }

  const result = await OrderModel.create(order);

  return result;
}

export async function dataExport() {
  const sort = {
    $sort: {
      createdOn: -1,
    },
  };

  const find = await getDataWithPaging(
    null,
    1,
    1000000,
    sort,
    OrderModel,
    "order"
  );

  const { data } = find;

  let response: any[] = [];

  for (const obj of data) {
    const {
      customerId,
      rightStockName,
      stockVolume,
      rightSpecialName,
      customerStock,
      rightSpecialVolume,
      paidRightVolume,
      paidSpecialVolume,
      paymentAmount,
      returnAmount,
      excessAmount,
    } = obj;

    const {
      id,
      name,
      lastname,
      nationalId,
      telephone,
      atsBank,
      atsBankNo,
      refNo,
    } = customerId;

    const { rightStockVolume } = customerStock;

    let tempAllow = paymentAmount - excessAmount;

    response.push({
      customerId: refNo,
      customerName: name,
      customerLastname: lastname,
      customerNationalId: refNo,
      telephone,
      atsBank,
      atsBankNo,
      rightStockName,
      stockVolume,
      rightSpecialName,
      rightStockVolume,
      rightSpecialVolume,
      paidRightVolume,
      paidSpecialVolume,
      paymentAmount,
      returnAmount: excessAmount,
      allowedAmount: tempAllow < 0 ? tempAllow * -1 : tempAllow,
    });
  }

  return response;
}
