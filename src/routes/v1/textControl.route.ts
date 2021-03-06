import express from "express";
import { TextControlModel } from "../../models/textControl.model";

var router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { button } = req.query;

    const results = await TextControlModel.findOne(
      button
        ? {
            button: button.toString(),
            status: true,
          }
        : {}
    ).lean();

    return res
      .status(200)
      .send({ code: "ERO-0001", message: "ok", data: results });
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

    const { button, textDescription, status } = body;

    const result = await TextControlModel.create({
      button,
      textDescription,
      status: true,
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
