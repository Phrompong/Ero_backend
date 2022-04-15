import express from "express";
import { StatusModel } from "../../models/status.model";

var router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await StatusModel.find().lean();

    return res
      .status(200)
      .send({ code: "ERO-0001", message: "ok", data: result });
  } catch (error) {
    const err = error as Error;

    return res.status(400).send({ code: "ERO-0010", message: err.message });
  }
});

export default router;
