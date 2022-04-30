import express from "express";
import { MasterBankModel } from "../../models/master.bank.model";

var router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { type } = req.query;

    const result = await MasterBankModel.find({ isActive: true }).lean();

    return res
      .status(200)
      .send({ code: "ERO-0001", message: "ok", data: result });
  } catch (error) {
    const err = error as Error;

    return res.status(400).send({ code: "ERO-0010", message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = req.body;

    if (Object.keys(body).length === 0) {
      return res
        .status(400)
        .send({ code: "ERO-0011", message: "Body is missing" });
    }

    const {
      nameTH,
      nameEN,
      ref1,
      ref2,
      logo,
      qrCode,
      shortName,
      accountName,
      accountNumber,
      branch,
    } = body;

    const result = await MasterBankModel.create({
      shortName,
      nameTH,
      nameEN,
      ref1,
      ref2,
      logo,
      qrCode,
      accountName,
      accountNumber,
      branch,
      isActive: true,
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
