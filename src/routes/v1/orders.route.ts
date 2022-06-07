import { mongoose } from "@typegoose/typegoose";
import {
  getCurrentOrderAmount,
  getDataWithPaging,
  getOrderCompareSales,
} from "../../controllers/common.controller";
import express from "express";
import { Order, OrderModel } from "../../models/order.model";
import { statusData } from "../../controllers/status.controller";
import {
  startOfToday,
  startOfDay,
  endOfDay,
  startOfYear,
  endOfYear,
} from "date-fns";
import { CustomerStockModel } from "../../models/customer.stock.model";
import * as excelJS from "exceljs";
import {
  getOrderExport,
  exportExcel,
} from "../../controllers/order.controller";
import { create } from "../../controllers/orderHistory.controller";

var router = express.Router();

router.post("/", async (req, res) => {
  try {
    const body = req.body;

    if (Object.keys(body).length === 0) {
      return res
        .status(400)
        .send({ code: "ERO-0011", message: "Body is missing" });
    }

    const {
      rightStockName,
      stockVolume,
      rightSpecialName,
      rightSpecialVolume,
      paidRightVolume,
      paidSpecialVolume,
      paymentAmount,
      returnAmount,
      excessVolume,
      customerName,
      customerTel,
      brokerId,
      accountNo,
      customerStockId,
      address,
      bankRefund,
      bankRefundNo,
      registrationNo,
      paymentDate,
    } = body as any;

    // * Process excess amount
    let excessAmount = 0;
    const customer = await CustomerStockModel.findOne({
      customerId: body.customerId,
    });

    if (!customer) {
      return res.status(400).send({
        code: "ERO-0012",
        message: `customerId ${body.customerId} is not found`,
      });
    }

    excessAmount = customer.offerPrice * excessVolume;

    const { name, houseNo, district, province, zipcode, tel } = address;

    const order = {
      customerId: mongoose.Types.ObjectId(body.customerId),
      rightStockName,
      stockVolume,
      rightSpecialName,
      rightSpecialVolume,
      paidRightVolume,
      paidSpecialVolume,
      paymentAmount,
      returnAmount,
      excessAmount,
      status: statusData.filter((o) => o.status === "รอหลักฐานการโอนเงิน")[0]
        ._id,
      createdOn: new Date(),
      customerName,
      customerTel,
      brokerId: mongoose.Types.ObjectId(brokerId),
      accountNo,
      customerStockId: mongoose.Types.ObjectId(customerStockId),
      address,
      registrationNo,
      bankRefund: mongoose.Types.ObjectId(bankRefund),
      bankRefundNo,
      paymentDate,
    };

    const result = await OrderModel.updateOne(
      {
        registrationNo,
        rightStockName,
      },
      order,
      { upsert: true }
    );

    // * Create order history
    await create(order);

    const data = await OrderModel.findOne({
      registrationNo,
      rightStockName,
    });

    return res.status(200).send({ code: "ERO-0001", message: "ok", data });
  } catch (error) {
    const err = error as Error;

    return res.status(400).send({ code: "ERO-0010", message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    if (Object.keys(body).length === 0) {
      return res
        .status(400)
        .send({ code: "ERO-0011", message: "Body is missing" });
    }

    if (!id) {
      return res
        .status(400)
        .send({ code: "ERO-0012", message: "id is missing" });
    }

    const { status } = req.body;

    const result = await OrderModel.findByIdAndUpdate(id, {
      status: mongoose.Types.ObjectId(status.toString()),
    });

    return res.status(200).send({ code: "ERO-0001", message: "ok" });
  } catch (error) {
    const err = error as Error;

    return res.status(400).send({ code: "ERO-0010", message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { customerId, rightStockName } = req.query;

    let obj: any = {};
    const limitInput = req.query.limit?.toString() || "10";
    const pageInput = req.query.page?.toString() || "1";

    if (customerId) {
      obj.customerId = { $eq: mongoose.Types.ObjectId(customerId.toString()) };
    }

    if (rightStockName) {
      obj.rightStockName = {
        $eq: rightStockName,
      };
    }

    const sort = {
      $sort: {
        createdOn: -1,
      },
    };

    const test = await OrderModel.find(obj).lean();

    const find = await getDataWithPaging(
      obj,
      +pageInput,
      +limitInput,
      sort,
      OrderModel,
      "order"
    );

    if (!find) {
      return res.status(200).send({
        _metadata: {
          pageSize: 10,
          currentPage: +pageInput,
          totalPages: 1,
        },
        code: "ERO-0001",
        message: "Data not found",
        data: [],
      });
    }

    const { _metadata, data } = find;

    return res
      .status(200)
      .send({ _metadata, code: "ERO-0001", message: "ok", data });
  } catch (error) {
    const err = error as Error;

    return res.status(400).send({ code: "ERO-0010", message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(200)
        .send({ code: "ERO-0011", message: "id is missing" });
    }

    const result = await OrderModel.findById(id)
      .populate("customerStockId")
      .populate("status")
      .lean();

    return res
      .status(200)
      .send({ code: "ERO-0001", message: "ok", data: result });
  } catch (error) {
    const err = error as Error;

    return res.status(400).send({ code: "ERO-0010", message: err.message });
  }
});

// * For search name-surname , rightStockName
router.get("/search/value", async (req, res) => {
  try {
    let { key, type, customerId, startDate, endDate } = req.query;

    const limitInput = req.query.limit?.toString() || "10";
    const pageInput = req.query.page?.toString() || "1";
    const sort = {
      $sort: {
        createdOn: 1,
      },
    };

    let startDataValue;
    let endDateValue;

    if (startDate && endDate) {
      startDataValue = startOfDay(new Date(startDate as string));
      endDateValue = endOfDay(new Date(endDate as string));
    }

    const obj: any = {};
    if (customerId) {
      obj.customerId = { $eq: mongoose.Types.ObjectId(customerId.toString()) };
    }

    const filter = obj;

    const find = await getDataWithPaging(
      filter,
      +pageInput,
      +limitInput,
      sort,
      OrderModel,
      "orderSearch",
      key ? key.toString().toLowerCase() : "",
      startDataValue,
      endDateValue
    );

    if (!find) {
      return res.status(200).send({
        _metadata: {
          pageSize: 10,
          currentPage: +pageInput,
          totalPages: 1,
        },
        code: "ERO-0001",
        message: "Data not found",
        data: [],
      });
    }

    const { _metadata, data } = find;

    return res
      .status(200)
      .send({ _metadata, code: "ERO-0001", message: "ok", data });
  } catch (error) {
    const err = error as Error;

    return res.status(400).send({ code: "ERO-0010", message: err.message });
  }
});

// * For get order using progress bar
router.get("/progressPie/currentOrderAmount", async (req, res) => {
  try {
    const { key, type, startDate, endDate } = req.query;

    let startDataValue;
    let endDateValue;

    if (startDate && endDate) {
      startDataValue = startOfDay(new Date(startDate as string));
      endDateValue = endOfDay(new Date(endDate as string));
    }

    const result = await getCurrentOrderAmount(
      key?.toString().toLocaleLowerCase() || "",
      startDataValue,
      endDateValue
    );

    return res
      .status(200)
      .send({ code: "ERO-0001", message: "ok", data: result });
  } catch (error) {
    const err = error as Error;

    return res.status(400).send({ code: "ERO-0010", message: err.message });
  }
});

router.get("/progressPie/orderCompareSales", async (req, res) => {
  try {
    const { key, type, startDate, endDate } = req.query;

    let startDataValue;
    let endDateValue;

    if (startDate && endDate) {
      startDataValue = startOfDay(new Date(startDate as string));
      endDateValue = endOfDay(new Date(endDate as string));
    }

    const result = await getOrderCompareSales(
      key?.toString().toLocaleLowerCase() || "",
      startDataValue,
      endDateValue
    );

    return res
      .status(200)
      .send({ code: "ERO-0001", message: "ok", data: result });
  } catch (error) {
    const err = error as Error;

    return res.status(400).send({ code: "ERO-0010", message: err.message });
  }
});

// * Export data
router.get("/export/excel", async (req, res) => {
  try {
    return await exportExcel({
      key: "1",
      res,
      filename: "test",
      sheetname: "test",
    });
    // const workbook = new excelJS.Workbook();
    // let sheet = workbook.addWorksheet("ERO");

    // sheet.columns = [
    //   {
    //     header: "Customer ID",
    //     key: "customerId",
    //     width: 20,
    //     border: {
    //       top: { style: "thin" },
    //       left: { style: "thin" },
    //       bottom: { style: "thin" },
    //       right: { style: "thin" },
    //     },
    //   },
    //   { header: "Customer Name", key: "customerName", width: 20 },
    //   { header: "Customer Lastname", key: "customerLastname", width: 20 },
    //   { header: "Customer National ID", key: "customerNationalId", width: 20 },
    //   { header: "Telephone", key: "telephone", width: 20 },
    //   { header: "ATS Bank", key: "atsBank", width: 20 },
    //   { header: "ATS Bank No", key: "atsBankNo", width: 20 },
    //   { header: "Right Stock Name", key: "rightStockName", width: 20 },
    //   { header: "Stock Volume", key: "stockVolume", width: 20 },
    //   { header: "Right Special Name", key: "rightSpecialName", width: 20 },
    //   { header: "Right Stock Volume", key: "rightStockVolume", width: 20 },
    //   { header: "Right Special Volume", key: "rightSpecialVolume", width: 20 },
    //   { header: "Paid Right Volume", key: "paidRightVolume", width: 20 },
    //   { header: "Paid Special Volume", key: "paidSpecialVolome", width: 20 },
    //   { header: "Payment Amount", key: "paymentAmount", width: 20 },
    //   { header: "Allowed Amount", key: "allowedAmount", width: 20 },
    //   { header: "Return Amount", key: "returnAmount", width: 20 },
    // ];

    // const data = await dataExport();

    // sheet.addRows(data);

    // // res is a Stream object
    // res.setHeader(
    //   "Content-Type",
    //   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    // );
    // res.setHeader("Content-Disposition", "attachment; filename=" + `rop.xlsx`);

    // return workbook.xlsx.write(res).then(function () {
    //   res.status(200).end();
    // });
  } catch (error) {
    const err = error as Error;
    return res.status(400).send({ code: "ERO-0011", message: err.message });
  }
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { isCheck } = req.body;

  if (Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .send({ code: "ERO-0011", message: "Body is missing" });
  }

  if (!id) {
    return res.status(400).send({ code: "ERO-0012", message: "id is missing" });
  }

  const result = await OrderModel.updateOne(
    { _id: mongoose.Types.ObjectId(id) },
    { $set: { isCheck } }
  );

  return res.status(200).send({ code: "ERO-0001", message: "ok" });
});

export default router;
