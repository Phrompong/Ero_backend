import express from "express";
import { AuthModel } from "../../models/auth.model";
import { adminSignIn, customerSignIn } from "../../controllers/auth.controller";

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

      const signIn = await customerSignIn(nationalId);

      if (!signIn) {
        return res.status(401).send({
          code: "ERO-0012",
          message: "Unauthorized",
        });
      }

      return res.status(200).send({
        code: "ERO-0001",
        message: "Sigin success",
        data: { customerId: signIn.customerId, isAccept: signIn.isAccept },
      });
    } else {
      const { username, password } = body;

      const signIn = await adminSignIn(username, password);

      if (!signIn) {
        return res.status(401).send({
          code: "ERO-0013",
          message: "Unauthorized",
        });
      }

      return res
        .status(200)
        .send({ code: "ERO-0001", message: "Sigin success" });
    }
  } catch (error) {
    const err = error as Error;

    return res.status(400).send({ code: "ERO-0010", message: err.message });
  }
});

export default router;
