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
    } = obj;

    const { id, name, lastname, nationalId, telephone, atsBank, atsBankNo } =
      customerId;

    const { rightStockVolume } = customerStock;

    response.push({
      customerId: id,
      customerName: name,
      customerLastname: lastname,
      customerNationalId: nationalId,
      telephone,
      atsBank,
      atsBankNo,
      rightStockName,
      stockVolume,
      rightSpecialName,
      rightStockVolume,
      rightSpecialVolume,
    });
  }

  return response;
}
