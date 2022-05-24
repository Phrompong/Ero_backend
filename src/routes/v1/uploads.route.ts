import { mongoose } from "@typegoose/typegoose";
import express from "express";
import {
  MasterCustomer,
  MasterCustomerModel,
} from "../../models/master.customer.model";
import {
  CustomerStock,
  CustomerStockModel,
} from "../../models/customer.stock.model";
import { TestModel } from "../../models/test.model";
import { v4 as uuidv4 } from "uuid";
import { decodeJwtToken, getToken } from "../../controllers/auth.controller";
import { OrderModel } from "../../models/order.model";
import { statusData } from "../../controllers/status.controller";
import { ConsentHistoryModel } from "../../models/consentHistory.model";
import { validateHeaderExcel } from "../../controllers/validate.controller";
import { MasterBrokerModel } from "../../models/master.broker.model";

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
    const { type } = req.query;
    const files = req.files;

    if (type !== "broker") {
      if (files.length === 0) {
        return res
          .status(400)
          .send({ code: "ERO-0011", message: "Request file not found" });
      }

      const file = reader.readFile(
        path.join(__dirname, `../../../excels/${files[0].filename}`)
      );

      const temps = reader.utils.sheet_to_json(
        file.Sheets[file.SheetNames[0]],
        {
          defval: "",
        }
      );

      // * Insert value to mongo
      for (const temp of temps) {
        const keys = Object.keys(temp);

        const no = temp[validateHeaderExcel(0, keys[0])];
        const rightStockName = temp[validateHeaderExcel(1, keys[1])];
        const registrationNo = temp[validateHeaderExcel(2, keys[2])];
        const holderType = temp[validateHeaderExcel(3, keys[3])];
        const stockVolume = temp[validateHeaderExcel(4, keys[4])];
        const titleCode = temp[validateHeaderExcel(5, keys[5])];
        const title = temp[validateHeaderExcel(6, keys[6])];
        const name = temp[validateHeaderExcel(7, keys[7])];
        const lastname = temp[validateHeaderExcel(8, keys[8])];
        const address = temp[validateHeaderExcel(9, keys[9])];
        const zipcode = temp[validateHeaderExcel(10, keys[10])];
        const home = temp[validateHeaderExcel(11, keys[11])];
        const office = temp[validateHeaderExcel(12, keys[12])];
        const telephone = temp[validateHeaderExcel(13, keys[13])];
        const fax = temp[validateHeaderExcel(14, keys[14])];
        const email = temp[validateHeaderExcel(15, keys[15])];
        const withHoldingTaxType = temp[validateHeaderExcel(16, keys[16])];
        const taxId = temp[validateHeaderExcel(17, keys[17])];
        const taxRate = temp[validateHeaderExcel(18, keys[18])];
        const nationalityCode = temp[validateHeaderExcel(19, keys[19])];
        const occupationCode = temp[validateHeaderExcel(20, keys[20])];
        const bankCode = temp[validateHeaderExcel(21, keys[21])];
        const account = temp[validateHeaderExcel(22, keys[22])];
        const partiNo = temp[validateHeaderExcel(23, keys[23])];
        const refType = temp[validateHeaderExcel(24, keys[24])];
        const refNo = temp[validateHeaderExcel(25, keys[25])];
        const eligibleSecurities = temp[validateHeaderExcel(26, keys[26])];
        const noForCalculation = temp[validateHeaderExcel(27, keys[27])];
        const ratio = temp[validateHeaderExcel(28, keys[28])];
        const rightStockVolume = temp[validateHeaderExcel(29, keys[29])];
        const noSubAllocate = temp[validateHeaderExcel(30, keys[30])];
        const partiNo2 = temp[validateHeaderExcel(31, keys[31])];
        const brokerateAccount = temp[validateHeaderExcel(32, keys[32])];
        const rightSpecialName = temp[validateHeaderExcel(33, keys[33])];
        const rightSpecialVolume = temp[validateHeaderExcel(34, keys[34])];
        const detailShort = temp[validateHeaderExcel(35, keys[35])];
        const detailFull = temp[validateHeaderExcel(36, keys[36])];

        // * Insert master customer
        const masterCustome: MasterCustomer = {
          no,
          holderType,
          titleCode,
          title,
          name,
          lastname,
          address,
          zipcode,
          home,
          office,
          telephone,
          fax,
          email,
          taxId,
          taxRate,
          nationalityCode,
          occupationCode,
          bankCode,
          account,
          createdOn: new Date(),
          createdBy: "Import excel",
          atsBank: "",
          atsBankNo: "",
          refNo: refNo.trim(),
        };

        const insertMasterCustomer = await MasterCustomerModel.updateOne(
          { taxId, refNo },
          {
            $set: {
              ...masterCustome,
            },
          },
          { upsert: true, new: true }
        );

        const masterCustomer = await MasterCustomerModel.findOne({
          taxId,
          refNo,
        }).lean();

        if (!masterCustomer) {
          return res
            .status(400)
            .send({ code: "ERO-0012", message: "Unable to create customer" });
        }

        const splitRatio = ratio.split("@");
        const offerPrice = splitRatio[1].trim();

        const splitFirstRatio = splitRatio[0].split(":");

        let getRight = splitFirstRatio[0].trim();
        let resultRatio = splitFirstRatio[1].trim();

        // * Insert customer stock
        const customerStock: CustomerStock = {
          customerId: masterCustomer._id,
          rightStockName,
          registrationNo,
          stockVolume,
          withHoldingTaxType,
          partiNo,
          refType,
          eligibleSecurities,
          noForCalculation,
          ratio: +resultRatio,
          rightStockVolume,
          noSubAllocate,
          partiNo2,
          brokerateAccount,
          rightSpecialName: rightSpecialName || "NCAP-W1",
          rightSpecialVolume,
          detailFull,
          detailShort,
          isActive: true,
          offerPrice,
          company: "",
          getRight,
          taxRate,
          createdOn: new Date(),
          createdBy: "Import excel",
        };

        const insertCustomerStock = await CustomerStockModel.updateOne(
          {
            customerId: mongoose.Types.ObjectId(masterCustomer._id),
            registrationNo,
          },
          {
            $set: { ...customerStock },
          },
          { upsert: true }
        );
      }
    } else {
      const file = reader.readFile(
        path.join(__dirname, `../../../excels/${files[0].filename}`)
      );

      const temps = reader.utils.sheet_to_json(
        file.Sheets[file.SheetNames[0]],
        {
          defval: "",
        }
      );

      for (const temp of temps) {
        const code = temp["Code"];
        const name = temp["Name"];
        const nameEN = temp["NameEN"];

        await MasterBrokerModel.updateOne(
          { code },
          {
            code,
            name,
            nameEN,
            status: true,
          },
          { upsert: true }
        );
      }
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

    const attachedFile = `${process.env.IPADDRESS_URI}/api/v1/renders?filename=${files[0].filename}`;

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

router.post("/bookbank", uploadImage.any(), async (req: any, res: any) => {
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

    const attachedFileBookBank = `${process.env.IPADDRESS_URI}/api/v1/renders?filename=${files[0].filename}`;

    // * Upsert to orders
    await OrderModel.findByIdAndUpdate(
      orderId,
      {
        attachedFileBookBank,
        attachedBookBankOn: new Date(),
      },
      {
        upsert: true,
      }
    );

    return res
      .status(200)
      .send({ code: "ERO-0001", message: "ok", data: attachedFileBookBank });
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

router.get("/delete", async (req: any, res: any) => {
  await ConsentHistoryModel.deleteMany({});

  await CustomerStockModel.deleteMany({});

  await MasterCustomerModel.deleteMany({});

  await OrderModel.deleteMany({});

  return res.status(400).send({ code: "ERO-0010", message: "delete ok" });
});

export default router;
