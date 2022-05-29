import express from "express";
import { exportExcel } from "../../controllers/order.controller";

var router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { topic } = req.query;

    if (!topic) {
      return res
        .status(400)
        .send({ code: "ERO-0011", message: "topic is missing value" });
    }

    return await exportExcel({
      key: topic,
      res,
      filename: topic,
      sheetname: `sheet_${topic}`,
    });
  } catch (error) {
    const err = error as Error;

    return res.status(400).send({ code: "ERO-0010", message: err.message });
  }
});

export default router;
