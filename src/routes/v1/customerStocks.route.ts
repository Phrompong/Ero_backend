import { mongoose } from "@typegoose/typegoose";
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

      result = await CustomerStockModel.find({
        customerId: mongoose.Types.ObjectId(customerId.toString()),
        isActive: true,
      })
        .populate("customerId")
        .sort({ createdOn: -1 })
        .lean();
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

export default router;
