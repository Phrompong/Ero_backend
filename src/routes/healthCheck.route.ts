// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require("../../package.json");
import express from "express";

const router = express.Router();

router.get("/", (_req, res) => {
  return res.status(200).send({ message: "ok" });
});

export default router;
