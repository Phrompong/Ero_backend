import express from "express";
import { MasterCustomerModel } from "../../models/master.customer.model";

var router = express.Router();

router.get("/", async (req, res) => {
  try {
    const customer = await MasterCustomerModel.find().limit(10).lean();

    return res
      .status(200)
      .send({ code: "ERO-0001", message: "ok", data: customer });
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
        .status(400)
        .send({ code: "ERO-0011", message: "id is missing" });
    }

    const customer = await MasterCustomerModel.findById(id)
      .populate("customerStock")
      .lean();

    return res
      .status(200)
      .send({ code: "ERO-0001", message: "ok", data: customer });
  } catch (error) {
    const err = error as Error;

    return res.status(400).send({ code: "ERO-0010", message: err.message });
  }
});

export default router;
