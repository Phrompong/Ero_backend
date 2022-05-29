import express from "express";
import { exportExcel, exportText } from "../../controllers/order.controller";

var router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { topic, fileExtension } = req.query;

    switch (fileExtension) {
      case "xlsx":
        return await exportExcel({
          key: topic,
          res,
          filename: topic,
          sheetname: `sheet_${topic}`,
        });
      case "txt":
        return await exportText({ key: topic, filename: topic, res });
    }
  } catch (error) {
    const err = error as Error;

    return res.status(400).send({ code: "ERO-0010", message: err.message });
  }
});

export default router;
