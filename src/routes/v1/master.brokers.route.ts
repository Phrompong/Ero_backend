import { mongoose } from "@typegoose/typegoose";
import express from "express";
import { MasterBrokerModel } from "../../models/master.broker.model";

var router = express.Router();

router.post("/", async (req, res) => {
  try {
    const body = req.body;

    if (Object.keys(body).length === 0) {
      return res
        .status(400)
        .send({ code: "ERO-0011", message: "Body is missing" });
    }

    const { code, name } = body;

    const result = await MasterBrokerModel.create({
      code,
      name,
      status: true,
    });

    return res
      .status(400)
      .send({ code: "ERO-0010", message: "ok", data: result });
  } catch (error) {
    const err = error as Error;

    return res.status(400).send({ code: "ERO-0010", message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const results = await MasterBrokerModel.aggregate([
      {
        $match: {
          status: true,
          isShow: true,
        },
      },
      {
        $project: {
          _id: 1,
          code: 1,
          name: 1,
          status: 1,
          searchValue: { $concat: ["$code", " ", "$name"] },
        },
      },
    ]);

    return res
      .status(200)
      .send({ code: "ERO-0001", message: "ok", data: results });
  } catch (error) {
    const err = error as Error;

    return res.status(400).send({ code: "ERO-0010", message: err.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const { name, nameEN } = req.body;
    if (!_id) {
      return res.status(400).send({ code: "ERO-0001", message: "missing id" });
    }

    await MasterBrokerModel.findByIdAndUpdate(_id, {
      name,
      nameEN,
    });

    return res.status(200).send({ code: "ERO-0001", message: "ok" });
  } catch (error) {
    const err = error as Error;

    return res.status(400).send({ code: "ERO-0010", message: err.message });
  }
});

// // * For update status broker ex false all and some value is true follow request
// router.put("", async (req, res) => {
//   try {
//     const { isAll } = req.query;
//     const body = req.body as string[];
//   } catch (error) {
//     const err = error as Error;

//     return res.status(400).send({ code: "ERO-0010", message: err.message });
//   }
// });
export default router;
