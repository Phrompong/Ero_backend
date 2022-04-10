import express from "express";
import * as jwt from "jsonwebtoken";
import { UserModel } from "../../models/users.model";
import { AuthModel } from "../../models/auth.model";
import md5 from "md5";

var router = express.Router();

router.post("/signIn", async (req, res) => {
  try {
    const body = req.body;
    const userAgent = req.headers["user-agent"];
    const platform = req.headers["sec-ch-ua-platform"];

    if (Object.keys(body).length === 0) {
      return res
        .status(400)
        .send({ code: "ERO-0011", message: "Body is missing" });
    }

    const { username, password } = body;

    const user = await UserModel.find({
      username: username.trim(),
      password: md5(password.trim()),
    });

    if (user.length === 0) {
      return res
        .status(401)
        .send({ code: "ERO-0001", message: "Unauthorized" });
    }

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
