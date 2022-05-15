import { mongoose } from "@typegoose/typegoose";
import {
  getCurrentOrderAmount,
  getDataWithPaging,
  getOrderCompareSales,
} from "../../controllers/common.controller";
import express from "express";
import { Order, OrderModel } from "../../models/order.model";
import { statusData } from "../../controllers/status.controller";
import { startOfToday, endOfToday, startOfYear, endOfYear } from "date-fns";
import { CustomerStockModel } from "../../models/customer.stock.model";

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

    const result = await OrderModel.create({
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
      brokerId,
      accountNo,
      customerStockId: mongoose.Types.ObjectId(customerStockId),
      address,
      registrationNo,
      bankRefund: mongoose.Types.ObjectId(bankRefund),
      bankRefundNo,
    });

    return res
      .status(200)
      .send({ code: "ERO-0001", message: "ok", data: result });
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
    const { key, type, customerId } = req.query;

    const limitInput = req.query.limit?.toString() || "10";
    const pageInput = req.query.page?.toString() || "1";
    const sort = {
      $sort: {
        createdOn: -1,
      },
    };

    let startDate: Date | undefined = undefined;
    let endDate: Date | undefined = undefined;

    if (type === "day") {
      startDate = startOfToday();
      endDate = endOfToday();
    } else if (type === "year") {
      startDate = startOfYear(new Date());
      endDate = endOfYear(new Date());
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
      startDate,
      endDate
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
    const { key, type } = req.query;

    let startDate: Date;
    let endDate: Date;

    if (type === "day") {
      startDate = startOfToday();
      endDate = endOfToday();
    } else if (type === "year") {
      startDate = startOfYear(new Date());
      endDate = endOfYear(new Date());
    } else {
      return res
        .status(400)
        .send({ code: "ERO-0011", message: "Please select type day and year" });
    }

    const result = await getCurrentOrderAmount(
      key?.toString().toLocaleLowerCase() || "",
      startDate,
      endDate
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
    const { key, type } = req.query;

    let startDate: Date;
    let endDate: Date;

    if (type === "day") {
      startDate = startOfToday();
      endDate = endOfToday();
    } else if (type === "year") {
      startDate = startOfYear(new Date());
      endDate = endOfYear(new Date());
    } else {
      return res
        .status(400)
        .send({ code: "ERO-0011", message: "Please select type day and year" });
    }

    const result = await getOrderCompareSales(
      key?.toString().toLocaleLowerCase() || "",
      startDate,
      endDate
    );

    return res
      .status(200)
      .send({ code: "ERO-0001", message: "ok", data: result });
  } catch (error) {
    const err = error as Error;

    return res.status(400).send({ code: "ERO-0010", message: err.message });
  }
});

export default router;
