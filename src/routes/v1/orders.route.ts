import { mongoose } from "@typegoose/typegoose";
import { getDataWithPaging } from "../../controllers/common.controller";
import express from "express";
import { OrderModel } from "../../models/order.model";
import { statusData } from "../../controllers/status.controller";

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
      rightSpacialName,
      rightSpacialVolume,
      paidRightVolume,
      paidSpecialVolume,
      paymentAmount,
      returnAmount,
    } = req.body;

    const result = await OrderModel.create({
      customerId: mongoose.Types.ObjectId(body.customerId),
      rightStockName,
      stockVolume,
      rightSpacialName,
      rightSpacialVolume,
      paidRightVolume,
      paidSpecialVolume,
      paymentAmount,
      returnAmount,
      status: statusData.filter((o) => o.status === "รอยืนยันการชำระเงิน")[0]
        ._id,
      createdOn: new Date(),
    });

    return res
      .status(200)
      .send({ code: "ERO-0001", message: "ok", data: result });
  } catch (error) {
    const err = error as Error;

    return res.status(400).send({ code: "ERO-0010", message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { customerId } = req.query;

    let obj: any = {};
    const limitInput = req.query.limit?.toString() || "10";
    const pageInput = req.query.page?.toString() || "1";

    if (customerId) {
      obj.customerId = { $eq: mongoose.Types.ObjectId(customerId.toString()) };
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
      OrderModel
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

    const result = await OrderModel.findById(id).lean();

    return res
      .status(200)
      .send({ code: "ERO-0001", message: "ok", data: result });
  } catch (error) {
    const err = error as Error;

    return res.status(400).send({ code: "ERO-0010", message: err.message });
  }
});

export default router;
