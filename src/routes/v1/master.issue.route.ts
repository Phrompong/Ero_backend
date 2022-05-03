import express from "express";
import { MasterIssueModel } from "../../models/master.issue.model";

var router = express.Router();

router.post("/", async (req, res) => {
  try {
    const body = req.body;

    if (Object.keys(body).length === 0) {
      return res
        .status(400)
        .send({ code: "ERO-0011", message: "Body is missing" });
    }

    const { nameTH, nameEN } = body;

    const result = await MasterIssueModel.create({
      nameTH,
      nameEN,
      isActive: true,
      createdOn: new Date(),
      createdBy: "",
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
    const result = await MasterIssueModel.find({
      isActive: true,
    }).lean();

    return res
      .status(200)
      .send({ code: "ERO-0001", message: "ok", data: result });
  } catch (error) {
    const err = error as Error;

    return res.status(400).send({ code: "ERO-0010", message: err.message });
  }
});

export default router;
