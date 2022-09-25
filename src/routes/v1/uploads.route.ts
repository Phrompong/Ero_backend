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
import { decrypt, encrypt } from "../../controllers/encrypt.controller";
import md5 from "md5";
import { MasterBankModel } from "../../models/master.bank.model";

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
    let a = 0;
    cb(
      null,
      `${Date.now()}_${file.originalname.substring(
        0,
        file.originalname.indexOf(".")
      )}` + path.extname(file.originalname)
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
        const registrationNo = temp[validateHeaderExcel(2, keys[2])]; // * encrypt
        const holderType = temp[validateHeaderExcel(3, keys[3])];
        const stockVolume = temp[validateHeaderExcel(4, keys[4])]; // * encrypt
        const titleCode = temp[validateHeaderExcel(5, keys[5])];
        const title = temp[validateHeaderExcel(6, keys[6])]; // * encrypt
        const name = temp[validateHeaderExcel(7, keys[7])]; // * encrypt
        const lastname = temp[validateHeaderExcel(8, keys[8])]; // * encrypt
        const address = temp[validateHeaderExcel(9, keys[9])]; // * encrypt
        const zipcode = temp[validateHeaderExcel(10, keys[10])]; // * encrypt
        const home = temp[validateHeaderExcel(11, keys[11])]; // * encrypt
        const office = temp[validateHeaderExcel(12, keys[12])]; // * encrypt
        const telephone = temp[validateHeaderExcel(13, keys[13])]; // * encrypt
        const fax = temp[validateHeaderExcel(14, keys[14])]; // * encrypt
        const email = temp[validateHeaderExcel(15, keys[15])]; // * encrypt
        const withHoldingTaxType = temp[validateHeaderExcel(16, keys[16])];
        const taxId = temp[validateHeaderExcel(17, keys[17])]; // * encrypt
        const taxRate = temp[validateHeaderExcel(18, keys[18])];
        const nationalityCode = temp[validateHeaderExcel(19, keys[19])];
        const occupationCode = temp[validateHeaderExcel(20, keys[20])];
        const bankCode = temp[validateHeaderExcel(21, keys[21])];
        const account = temp[validateHeaderExcel(22, keys[22])];
        const partiNo = temp[validateHeaderExcel(23, keys[23])];
        const refType = temp[validateHeaderExcel(24, keys[24])];
        const refNo = temp[validateHeaderExcel(25, keys[25])]
          ? temp[validateHeaderExcel(25, keys[25])].trim()
          : ""; // * encrypt
        const eligibleSecurities = temp[validateHeaderExcel(26, keys[26])];
        const noForCalculation = temp[validateHeaderExcel(27, keys[27])];
        // * encrypt
        const ratio = temp[validateHeaderExcel(28, keys[28])];
        const rightStockVolume = temp[validateHeaderExcel(29, keys[29])]; // * encrypt
        const noSubAllocate = temp[validateHeaderExcel(30, keys[30])];
        const partiNo2 = temp[validateHeaderExcel(31, keys[31])];
        const brokerateAccount = temp[validateHeaderExcel(32, keys[32])];
        const rightSpecialName = temp[validateHeaderExcel(33, keys[33])];
        const rightSpecialVolume = temp[validateHeaderExcel(34, keys[34])];
        const company = temp[validateHeaderExcel(35, keys[35])];
        const detailShort = temp[validateHeaderExcel(36, keys[36])];
        const detailFull = temp[validateHeaderExcel(37, keys[37])];
        const t = md5(temp[validateHeaderExcel(17, keys[17])]);
        const r = md5(temp[validateHeaderExcel(25, keys[25])]);
        const rtn = temp[validateHeaderExcel(2, keys[2])];

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
          refNo,
          r,
        };

        const insertMasterCustomer = await MasterCustomerModel.findOneAndUpdate(
          { refNo },
          {
            $set: {
              ...masterCustome,
            },
          },
          { upsert: true, new: true }
        ).lean();

        let customerId;
        const masterCustomer = await MasterCustomerModel.findOne({
          refNo,
        }).lean();

        if (!masterCustomer) {
          return res
            .status(400)
            .send({ code: "ERO-0012", message: "Unable to create customer" });
        }

        customerId = masterCustomer._id;

        const splitRatio = ratio.split("@");
        const offerPrice = splitRatio[1].trim();

        const splitFirstRatio = splitRatio[0].split(":");

        let getRight = splitFirstRatio[0].trim();
        let resultRatio = splitFirstRatio[1].trim();

        // * Insert customer stock
        const customerStock: CustomerStock = {
          customerId: customerId,
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
          rtn,
        };

        const insertCustomerStock = await CustomerStockModel.updateOne(
          {
            customerId: mongoose.Types.ObjectId(customerId),
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

    return res.status(400).send({ code: "ERO-0010", message: err });
  }
});

// * Upload for images
router.post("/image", uploadImage.any(), async (req: any, res: any) => {
  try {
    const oldFiles = req.body;
    const files = req.files;
    const userAgent = req.headers["user-agent"];
    const platform = req.headers["sec-ch-ua-platform"];
    const { orderId } = req.query;

    let _files = files;

    if (Object.keys(oldFiles).length > 0) _files = files.concat(oldFiles.File);

    if (_files.length === 0) {
      return res
        .status(400)
        .send({ code: "ERO-0011", message: "Request file not found" });
    }

    if (!orderId) {
      return res
        .status(400)
        .send({ code: "ERO-0011", message: "orderId is missing" });
    }

    let attachedFiles = [];

    // * Delete attachedFiles
    await OrderModel.updateOne(
      {
        _id: mongoose.Types.ObjectId(orderId.toString()),
      },
      { $set: { attachedFiles: [] } }
    );

    for (const file of _files) {
      const type = typeof file;

      let attachedFile = file;
      if (type !== "string")
        attachedFile = `${process.env.IPADDRESS_URI}/api/v1/renders?filename=${file.filename}`;

      // * Upsert to orders
      const update = await OrderModel.updateOne(
        {
          _id: mongoose.Types.ObjectId(orderId.toString()),
        },
        {
          $addToSet: { attachedFiles: attachedFile },
          $set: {
            attachedOn: new Date(),
            status: statusData.filter(
              (o) => o.status === "รอยืนยันการชำระเงิน"
            )[0]._id,
          },
        },
        {
          upsert: true,
        }
      );

      attachedFiles.push(attachedFile);
    }

    return res
      .status(200)
      .send({ code: "ERO-0001", message: "ok", data: attachedFiles });
  } catch (error) {
    const err = error as Error;

    return res.status(400).send({ code: "ERO-0010", message: err.message });
  }
});

router.post("/bookbank", uploadImage.any(), async (req: any, res: any) => {
  try {
    const files = req.files;

    if (!files || files.length == 0) {
      return res.status(200).send({ code: "ERO-0001", message: "ok" });
    }

    const userAgent = req.headers["user-agent"];
    const platform = req.headers["sec-ch-ua-platform"];
    const { orderId } = req.query;

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

router.patch(
  "/subscriptionNo",
  uploadExcel.any(),
  async (req: any, res: any) => {
    try {
      const { type } = req.query;
      const files = req.files;

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

      let check = 0;
      // * Insert value to mongo
      for (const temp of temps) {
        const keys = Object.keys(temp);

        const subscriptionNo = temp["Subscription No."];
        const registrationNo = temp["Account ID"];

        const result = await CustomerStockModel.updateOne(
          {
            registrationNo,
          },
          { $set: { subScriptionNo: subscriptionNo.toString().trim() } }
        ).lean();

        if (result.nModified === 1) {
          check++;
        }
      }

      return res.status(200).send({ code: "ERO-0001", message: "ok" });
    } catch (error) {
      const err = error as Error;

      return res.status(400).send({ code: "ERO-0010", message: err });
    }
  }
);

router.patch(
  "/order/announce",
  uploadExcel.any(),
  async (req: any, res: any) => {
    try {
      const { type } = req.query;
      const files = req.files;

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

      let check = 0;
      // * Insert value to mongo
      for (const temp of temps) {
        const keys = Object.keys(temp);

        const registrationNo = temp["เลขทะเบียนผู้ถือหุ้น"];
        const rightVolume = temp["จำนวนหุ้นตามสิทธิ"];
        const moreThanVolume = temp["จำนวนหุ้นเกินสิทธิ"];
        const allVolume = temp["จำนวนหุ้นรวม"];
        const warrantList = temp["จำนวนใบสำคัญแสดงสิทธิ"];

        await OrderModel.updateOne(
          {
            registrationNo: registrationNo.toString(),
          },
          {
            $set: {
              rightVolume,
              moreThanVolume,
              allVolume,
              warrantList,
            },
          }
        );
      }

      return res.status(200).send({ code: "ERO-0001", message: "ok" });
    } catch (error) {
      const err = error as Error;

      return res.status(400).send({ code: "ERO-0010", message: err });
    }
  }
);

router.patch(
  "/order/reutrnAmount",
  uploadExcel.any(),
  async (req: any, res: any) => {
    try {
      const { type } = req.query;
      const files = req.files;

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

      let check = 0;
      // * Insert value to mongo
      for (const temp of temps) {
        const keys = Object.keys(temp);

        const registrationNo = temp["Customer ID (เลขทะเบียนผู้ถือหุ้น)"];
        const netCustomerReceipt = temp["ลูกค้ารับเงินสุทธิ"];

        await OrderModel.updateOne(
          {
            registrationNo: registrationNo.toString(),
          },
          {
            $set: {
              netCustomerReceipt,
            },
          }
        );
      }

      return res.status(200).send({ code: "ERO-0001", message: "ok" });
    } catch (error) {
      const err = error as Error;

      return res.status(400).send({ code: "ERO-0010", message: err });
    }
  }
);

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

router.delete("/delete", async (req: any, res: any) => {
  return res.status(200).send({ code: "ERO-0010", message: "delete ok" });
});

router.post("/testImages", uploadImage.any(), async (req: any, res: any) => {
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

    const attachedFile = `${process.env.IPADDRESS_URI}/api/v1/renders?filename=${files[0].filename}`;

    return res
      .status(200)
      .send({ code: "ERO-0001", message: "ok", data: attachedFile });
  } catch (error) {
    const err = error as Error;

    return res.status(400).send({ code: "ERO-0010", message: err.message });
  }
});

export default router;
