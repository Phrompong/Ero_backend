import express from "express";
import { AuthModel } from "../../models/auth.model";
import { customerSignIn } from "../../controllers/auth.controller";

var router = express.Router();

router.post("/signIn", async (req, res) => {
  try {
    const body = req.body;
    const userAgent = req.headers["user-agent"];
    const platform = req.headers["sec-ch-ua-platform"];
    const { type } = req.query;

    if (Object.keys(body).length === 0) {
      return res
        .status(400)
        .send({ code: "ERO-0011", message: "Body is missing" });
    }

    const key = `${userAgent}${platform}`;
    let token = "";

    // * Customer
    if (type === "customer") {
      const { nationalId } = req.body;

      if (!nationalId) {
        return res
          .status(400)
          .send({ code: "ERO-0012", message: "nationalId is missing" });
      }

      const { token, customerId } = await customerSignIn(nationalId);

      return res.status(200).send({
        code: "ERO-0001",
        message: "Sigin success",
        data: { customerId },
      });
    }

    ///TODO Admin

    if (!token) {
      return res
        .status(401)
        .send({ code: "ERO-0013", message: "Unauthorized" });
    }

    const auth = await AuthModel.create({
      key,
      jwt: token,
    });

    return res
      .status(200)
      .send({ code: "ERO-0001", message: "Sigin success", data: auth._id });
  } catch (error) {
    const err = error as Error;

    return res.status(400).send({ code: "ERO-0010", message: err.message });
  }
});

export default router;
