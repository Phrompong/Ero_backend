import express from "express";
import { getAll, getById } from "../../controllers/orderHistory.controller";

var router = express.Router();

router.get("/", async (req, res) => {
  try {
    const data = await getAll();

    return res.status(200).send({ code: "ERO-0001", message: "ok", data });
  } catch (error) {
    const err = error as Error;
    return res.status(400).respond(-1, err.message);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(200).send({ code: "ERO-0001", message: "missing id" });
    }

    const data = await getById(id);

    return res.status(200).send({ code: "ERO-0001", message: "ok", data });
  } catch (error) {
    const err = error as Error;
    return res.status(400).respond(-1, err.message);
  }
});

export default router;
