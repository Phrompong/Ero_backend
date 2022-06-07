import express from "express";
import { User, UserModel } from "../../models/users.model";
import md5 from "md5";

var router = express.Router();

router.get("/", async (req, res) => {
  try {
    const data = await UserModel.find().lean();

    return res.status(200).send({ code: "ERO-0001", message: "ok", data });
  } catch (error) {
    const err = error as Error;

    return res.status(400).send({ code: "ERO-0010", message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(200).send({ code: "ERO-0001", message: "missing id" });
    }

    const data = await UserModel.findById(id).lean();

    return res.status(200).send({ code: "ERO-0001", message: "ok", data });
  } catch (error) {
    const err = error as Error;

    return res.status(400).send({ code: "ERO-0010", message: err.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { username } = req.body;

    if (!id) {
      return res.status(200).send({ code: "ERO-0001", message: "missing id" });
    }

    const data = await UserModel.findByIdAndUpdate(id, { username });

    return res.status(200).send({ code: "ERO-0001", message: "ok", data });
  } catch (error) {
    const err = error as Error;

    return res.status(400).send({ code: "ERO-0010", message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = req.body as User;

    if (Object.keys(body).length === 0) {
      return res
        .status(400)
        .send({ code: "ERO-0011", message: "Body is missing" });
    }

    const { username, password } = body;

    const users = await UserModel.find({ username }).lean();

    if (users.length > 0) {
      return res
        .status(400)
        .send({ code: "ERO-0012", message: "Username is duplicate" });
    }

    await UserModel.create({
      username: username.trim(),
      password: md5(password.trim()),
      createdOn: new Date(),
    });

    return res.status(200).send({ code: "ERO-0001", message: "ok" });
  } catch (error) {
    const err = error as Error;

    return res.status(400).send({ code: "ERO-0010", message: err.message });
  }
});

export default router;
