import express from "express";
import * as jwt from "jsonwebtoken";
import { AuthModel } from "../../models/auth.model";

var router = express.Router();

router.post("/signIn", async (req, res) => {
  try {
    const username = "";
    const password = "";
    const userAgent = req.headers["user-agent"];
    const platform = req.headers["sec-ch-ua-platform"];

    const key = `${userAgent}${platform}`;

    // * Create jwt token
    const token = jwt.sign({ username }, "test", {
      expiresIn: "1800s",
    });

    await AuthModel.create({
      key,
      jwt: token,
    });

    return res.status(200).send({ code: "ERO-0001", message: "Sigin success" });
  } catch (error) {
    const err = error as Error;

    return res.status(400).send({ code: "ERO-0010", message: err.message });
  }
});

export default router;
