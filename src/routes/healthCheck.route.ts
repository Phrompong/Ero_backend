// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require("../../package.json");
import express from "express";
import path from "path";

const router = express.Router();

router.get("/", (_req, res) => {
  return res.status(200).send({ message: "ok" });
});

router.get("/test", (req, res) => {
  // res.sendFile("../../images/buyPage1.jpeg");
  let a = path.join(__dirname + "../../../images/buyPage1.jpeg");
  res.sendFile(path.join(__dirname + "../../../images/buyPage1.jpeg"));
});

export default router;
