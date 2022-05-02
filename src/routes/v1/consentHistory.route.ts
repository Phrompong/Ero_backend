import { mongoose } from "@typegoose/typegoose";
import express from "express";
import { ConsentHistoryModel } from "../../models/consentHistory.model";

var router = express.Router();

router.post("/", async (req, res) => {
  try {
    const body = req.body;

    if (Object.keys(body).length === 0) {
      return res
        .status(400)
        .send({ code: "ERO-0011", message: "Body is missing" });
    }

    const { customerId } = body;

    if (!customerId) {
      return res
        .status(400)
        .send({ code: "ERO-0012", message: "customerId is missing" });
    }

    const result = await ConsentHistoryModel.create({
      customerId: mongoose.Types.ObjectId(customerId),
      isAccept: true,
    });

    return res
      .status(200)
      .send({ code: "ERO-0001", message: "ok", data: result });
  } catch (error) {
    const err = error as Error;

    return res.status(400).send({ code: "ERO-0010", message: err.message });
  }
});

export default router;
