import express from "express";
import path from "path";

var router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { filename } = req.query;

    res.sendFile(path.join(__dirname + `../../../../images/${filename}`));
  } catch (error) {
    const err = error as Error;

    return res.status(400).send({ code: "ERO-0010", message: err.message });
  }
});

export default router;
