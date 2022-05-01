import express from "express";
import {
  CustomerService,
  CustomerServiceModel,
} from "../../models/customerService.model";

var router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await CustomerServiceModel.find().lean();

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

    const { email, subject, issue, specifyIssue } = body as CustomerService;

    const result = await CustomerServiceModel.create({
      email,
      subject,
      issue,
      specifyIssue,
      createdOn: new Date(),
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
