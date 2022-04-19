import { mongoose } from "@typegoose/typegoose";
import express from "express";
import { MasterCustomerModel } from "../../models/master.customer.model";
import { CustomerStockModel } from "../../models/customer.stock.model";
import { TestModel } from "../../models/test.model";
import { v4 as uuidv4 } from "uuid";
import { decodeJwtToken, getToken } from "../../controllers/auth.controller";
import { OrderModel } from "../../models/order.model";
import { statusData } from "../../controllers/status.controller";

const multer = require("multer");
const reader = require("xlsx");
const path = require("path");

var router = express.Router();
// * Excel
const storageExcel = multer.diskStorage({
  destination: function (req: any, file: any, cb: any) {
    cb(null, "excels/");
  },

  filename: function (req: any, file: any, cb: any) {
    cb(
      null,
      file.fieldname + "" + Date.now() + path.extname(file.originalname)
    );
  },
});

// * Image
const storageImage = multer.diskStorage({
  destination: function (req: any, file: any, cb: any) {
    cb(null, "images/");
  },

  filename: function (req: any, file: any, cb: any) {
    cb(
      null,
      file.fieldname + "" + Date.now() + path.extname(file.originalname)
    );
  },
});

const uploadExcel = multer({ storage: storageExcel });
const uploadImage = multer({ storage: storageImage });

// * Uplaod for excel
router.post("/", uploadExcel.any(), async (req: any, res: any) => {
  try {
    const files = req.files;

    if (files.length === 0) {
      return res
        .status(400)
        .send({ code: "ERO-0011", message: "Request file not found" });
    }

    const file = reader.readFile(
      path.join(__dirname, `../../../excels/${files[0].filename}`)
    );

    const temps = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[0]]);

    // * Insert value to mongo

    for (const temp of temps) {
      const customerId = temp["Customer ID"];
      const customerName = temp["Customer Name"];
      const customerLastname = temp["Customer Lastname"];
      const customerNationalId = temp["Customer National ID"];
      const telephone = temp["Telephone"];
      const atsBank = temp["ATS Bank"];
      const atsBankNo = temp["ATS Bank No"];
      const rightStockName = temp["Right Stock Name"];
      const stockVolume = temp["Stock Volume"];
      const email = temp["e-Mail"];

      // * Insert master customer
      const insertMasterCustomer = await MasterCustomerModel.create({
        id: customerId,
        name: customerName,
        lastname: customerLastname,
        nationalId: customerNationalId,
        telephone,
        atsBank,
        atsBankNo,
        email,
        createdOn: new Date(),
        createdBy: "Import from excel",
      });

      // * Insert customer stock
      const insertCustomerStock = await CustomerStockModel.create({
        customerId: mongoose.Types.ObjectId(insertMasterCustomer._id),
        rightStockName,
        stockVolume,
        rightStockVolume: 0,
        rightSpecialName: "",
        rightSpecialVolume: 0,
        createdOn: new Date(),
        createdBy: "Import from excel",
      });
    }

    return res.status(200).send({ code: "ERO-0001", message: "ok" });
  } catch (error) {
    const err = error as Error;

    return res.status(400).send({ code: "ERO-0010", message: err.message });
  }
});

// * Upload for images
router.post("/image", uploadImage.any(), async (req: any, res: any) => {
  try {
    const files = req.files;
    const userAgent = req.headers["user-agent"];
    const platform = req.headers["sec-ch-ua-platform"];
    const { orderId } = req.query;

    if (files.length === 0) {
      return res
        .status(400)
        .send({ code: "ERO-0011", message: "Request file not found" });
    }

    if (!orderId) {
      return res
        .status(400)
        .send({ code: "ERO-0011", message: "orderId is missing" });
    }

    // const key = `${userAgent}${platform}`;

    // const token = await getToken(key);

    // if (!token) {
    //   return res.status(400).send({
    //     code: "ERO-0011",
    //     message: "Unable to get payload from token",
    //   });
    // }

    // /const paylaod = await decodeJwtToken(token);

    const attachedFile = `${process.env.IPADDRESS_URI}:${process.env.PORT}/api/v1/renders?filename=${files[0].filename}`;

    // * Upsert to orders
    await OrderModel.findByIdAndUpdate(
      orderId,
      {
        attachedFile,
        attachedOn: new Date(),
        status: statusData.filter((o) => o.status === "รอยืนยันการชำระเงิน")[0]
          ._id,
      },
      {
        upsert: true,
      }
    );

    return res
      .status(200)
      .send({ code: "ERO-0001", message: "ok", data: attachedFile });
  } catch (error) {
    const err = error as Error;

    return res.status(400).send({ code: "ERO-0010", message: err.message });
  }
});

router.get("/", async (req: any, res: any) => {
  try {
    const results = await TestModel.find().lean();

    return res
      .status(400)
      .send({ code: "ERO-0010", message: "ok", data: results });
  } catch (error) {
    const err = error as Error;

    return res.status(400).send({ code: "ERO-0010", message: err.message });
  }
});

export default router;
