import { mongoose } from "@typegoose/typegoose";
import { getDataWithPaging } from "../../controllers/common.controller";
import express from "express";
import { CustomerStockModel } from "../../models/customer.stock.model";

var router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { customerId, registrationNo } = req.query;

    let obj: any = {};

    let result: any;
    if (customerId) {
      obj.customerId = mongoose.Types.ObjectId(customerId.toString());

      result = await CustomerStockModel.aggregate([
        {
          $match: {
            customerId: mongoose.Types.ObjectId(customerId.toString()),
            isActive: true,
          },
        },
        {
          $lookup: {
            from: "cltOrders",
            localField: "_id",
            foreignField: "customerStockId",
            as: "orders",
          },
        },
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
          $unwind: {
            path: "$orders",
            preserveNullAndEmptyArrays: true,
          },
        },
      ]);

      // result = await CustomerStockModel.find({
      //   customerId: mongoose.Types.ObjectId(customerId.toString()),
      //   isActive: true,
      // })
      //   .populate("customerId")
      //   .sort({ createdOn: -1 })
      //   .lean();
    }

    if (customerId && registrationNo) {
      obj.customerId = mongoose.Types.ObjectId(customerId.toString());

      result = await CustomerStockModel.findOne({
        customerId: mongoose.Types.ObjectId(customerId.toString()),
        registrationNo: registrationNo.toString(),
        isActive: true,
      })
        .populate("customerId")
        .lean();
    }

    return res
      .status(200)
      .send({ code: "ERO-0001", message: "ok", data: result });
  } catch (error) {
    const err = error as Error;

    return res.status(400).send({ code: "ERO-0010", message: err.message });
  }
});

router.get("/search/value", async (req, res) => {
  try {
    const { key, customerId } = req.query;
    const obj = {} as any;
    const limitInput = req.query.limit?.toString() || "10";
    const pageInput = req.query.page?.toString() || "1";
    const sort = {
      $sort: {
        createdOn: -1,
      },
    };

    if (customerId) {
      obj.customerId = { $eq: mongoose.Types.ObjectId(customerId.toString()) };
    }

    const find = await getDataWithPaging(
      obj,
      +pageInput,
      +limitInput,
      sort,
      CustomerStockModel,
      "customerStockSearch",
      key ? key.toString().toLowerCase() : ""
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

router.patch("/", async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      await CustomerStockModel.updateMany(
        {},
        { $set: { rightSpecialName: "NCAP-W1" } }
      );

      return res.status(200).respond(0, "ok");
    }
  } catch (error) {
    const err = error as Error;
    return res.status(400).respond(-1, err.message);
  }
});

export default router;
