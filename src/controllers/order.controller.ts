import { WorkBook } from "xlsx";
import { Order, OrderModel } from "../models/order.model";
import { getDataWithPaging } from "./common.controller";
import * as excelJS from "exceljs";
import { forEach } from "lodash";
import { format } from "date-fns";
import { getOverPaymet } from "./overPayment.controller";
import { response } from "express";

export async function insert(order: Order) {
  if (!order) {
    return;
  }

  const result = await OrderModel.create(order);

  return result;
}

export async function exportExcel(obj: any) {
  const { key, res, filename, sheetname } = obj;

  const workbook = new excelJS.Workbook();
  let sheet = workbook.addWorksheet(sheetname || "ERO");
  const width = 20;

  const excelHandler: { [key: string]: any } = {
    aqs: {
      func: getOrderExport,
      columns: [
        {
          header: "Customer ID (เลขทะเบียนผู้ถือหุ้น)",
          key: "registrationNo",
          width: 20,
        },
        { header: "Customer Name", key: "customerName", width: 20 },
        { header: "Customer Lastname", key: "customerLastname", width: 20 },
        {
          header: "Customer National ID",
          key: "customerNationalId",
          width: 20,
        },
        { header: "Telephone", key: "telephone", width: 20 },
        { header: "ATS Bank", key: "atsBank", width: 20 },
        { header: "ATS Bank No", key: "atsBankNo", width: 20 },
        { header: "Right Stock Name", key: "rightStockName", width: 20 },
        { header: "Stock Volume", key: "stockVolume", width: 20 },
        { header: "Right Special Name", key: "rightSpecialName", width: 20 },
        { header: "Right Stock Volume", key: "rightStockVolume", width: 20 },
        {
          header: "Right Special Volume",
          key: "rightSpecialVolume",
          width: 20,
        },
        { header: "Paid Right Volume", key: "paidRightVolume", width: 20 },
        { header: "Paid Special Volume", key: "paidSpecialVolome", width: 20 },
        { header: "Payment Amount", key: "paymentAmount", width: 20 },
        { header: "Allowed Amount", key: "allowedAmount", width: 20 },
        { header: "Return Amount", key: "returnAmount", width: 20 },
        { header: "วันที่โอนเงิน", key: "paymentDate", width: 20 },
        { header: "เวลาโอนเงิน", key: "paymentTime", width: 20 },
        { header: "สถานะรายการ", key: "status", width: 20 },
        { header: "Code Bank", key: "codeBank", width: 20 },
        { header: "ธนาคารสำหรับคืนเงิน", key: "bankRefundName", width: 20 },
        {
          header: "เลขบัญชีธนาคารสำหรับคืนเงิน",
          key: "bankRefundNo",
          width: 20,
        },
        { header: "ที่อยู่", key: "address", width: 20 },
        { header: "วันที่จองซื้อ", key: "createdOn", width: 20 },
        { header: "วันที่อนุมัติ", key: "approvedOn", width: 20 },
        { header: "หมายเลขโบรกเกอร์", key: "brokerCode", width: 20 },
        { header: "โบรกเกอร์", key: "brokerName", width: 20 },
        { header: "เลขที่บัญชีซื้อขาย", key: "accountNo", width: 20 },
        { header: "ใบจองหุ้น", key: "atsCert", width: 20 },
        { header: "BookBank image", key: "attachedFileBookBank", width: 20 },
        { header: "Slip image", key: "attachedFile", width: 20 },
      ],
    },
    atsSba: {
      func: getOrderExport,
      columns: [
        {
          header: "Account",
          key: "",
          width,
        },
        {
          header: "BankCode",
          key: "",
          width,
        },
        {
          header: "DueDate",
          key: "",
          width,
        },
        {
          header: "ReceiveType",
          key: "",
          width,
        },
        {
          header: "BankAccount",
          key: "bankRefundNo",
          width,
        },
        {
          header: "CustName",
          key: "customerName",
          width,
        },
        {
          header: "Price",
          key: "paymentAmount",
          width,
        },
        {
          header: "ID",
          key: "",
          width,
        },
        {
          header: "DelFlag",
          key: "",
          width,
        },
        {
          header: "ExportDate",
          key: "exportDate",
          width,
        },
        {
          header: "ExportNo",
          key: "",
          width,
        },
        {
          header: "ExportTime",
          key: "exportTime",
          width,
        },
        {
          header: "AuthorUserID",
          key: "",
          width,
        },
        {
          header: "ExportGroupNo",
          key: "",
          width,
        },
        {
          header: "GroupDate",
          key: "exportDate",
          width,
        },
        { header: "วันที่จองซื้อ", key: "createdOn", width: 20 },
        { header: "เวลาที่อนุมัติ", key: "approvedOn", width: 20 },
      ],
    },
    dss: {
      func: getOrderExport,
      columns: [
        {
          header: "Transaction Type of Corporate Action",
          key: "",
          width,
        },
        {
          header: "Securities Symbol at",
          key: "rightStockName",
          width,
        },
        {
          header: "Book Closing Date",
          key: "",
          width,
        },
        {
          header: "Record Date",
          key: "",
          width,
        },
        {
          header: "Market ID",
          key: "",
          width,
        },
        {
          header: "Subscription No.",
          key: "subScriptionNo",
          width,
        },
        {
          header: "Account ID",
          key: "registrationNo",
          width,
        },
        {
          header: "Reference Type",
          key: "refType",
          width,
        },
        {
          header: "Reference No",
          key: "refNo",
          width,
        },
        {
          header: "Prefix",
          key: "titleCode",
          width,
        },
        {
          header: "Official Prefix",
          key: "title",
          width,
        },
        {
          header: "Official First Name",
          key: "name",
          width,
        },
        {
          header: "Official Last Name",
          key: "lastname",
          width,
        },
        {
          header: "Address",
          key: "address",
          width,
        },
        {
          header: "Zip Code",
          key: "zipcode",
          width,
        },
        {
          header: "Country Abbr",
          key: "",
          width,
        },
        {
          header: "Nationality",
          key: "",
          width,
        },
        {
          header: "Holder Type Code",
          key: "holderType",
          width,
        },
        {
          header: "Number of Share at Book Close",
          key: "",
          width,
        },
        {
          header: "Number of right subscribe/exercise",
          key: "",
          width,
        },
        {
          header: "Amount (BAHT)",
          key: "",
          width,
        },
        {
          header: "Subscription/Exercise Price",
          key: "offerPrice",
          width,
        },
        {
          header: "Subscription / Exercise Ratio",
          key: "ratio",
          width,
        },
        { header: "วันที่จองซื้อ", key: "createdOn", width: 20 },
        { header: "เวลาที่อนุมัติ", key: "approvedOn", width: 20 },
      ],
    },
    dss1: {
      func: getOrderExport,
      columns: [
        {
          header: "Security Symbol at Book Close C(20)",
          key: "fixName",
          width,
        },
        {
          header: "Market ID C(1)",
          key: "marketId",
          width,
        },
        {
          header: "Sequence No N(10.0)",
          key: "sequence",
          width,
        },
        {
          header: "Action Type C(1)",
          key: "actionType",
          width,
        },
        {
          header: "Transaction Date C(10)",
          key: "transactionDate",
          width,
        },
        {
          header: "Transaction No C(8.0)",
          key: "transactionNo",
          width,
        },
        {
          header: "Subscription Sequence No. N(10.0)",
          key: "subScriptionNo",
          width,
        },
        {
          header: "Account ID C(10)",
          key: "registrationNo",
          width,
        },
        {
          header: "Certificate ID",
          key: "certificateId",
          width,
        },
        {
          header: "Slip Transaction Date C(10)",
          key: "slipTransactionDate",
          width,
        },
        {
          header: "Slip Transaction No. N(8.0)",
          key: "slipTransactionNo",
          width,
        },
        {
          header: "Quantity of Subscribed Scrip N(18.0)",
          key: "cert",
          width,
        },
        {
          header: "Quantity of Subscribed Issuer Account N(18.0)",
          key: "quantityIssuerAccount",
          width,
        },
        {
          header: "Quantity of Subscribed Participant's Account N(18.0)",
          key: "volume",
          width,
        },
        {
          header: "Cheque Pool Flag C(1)",
          key: "chequePoolFlag",
          width,
        },
        {
          header: "Bank Code for Return Cash C(3)",
          key: "bankCodeReturnCash",
          width,
        },
        {
          header: "Bank Account for Return Cash C(15)",
          key: "bankAccountReturnCash",
          width,
        },
        {
          header: "US Indicia Flag C(1)",
          key: "usIndiciaFlag",
          width,
        },
        {
          header: "Entity Type Code C(2)",
          key: "entityTypeCode",
          width,
        },
        {
          header: "FATCA Status C(50)",
          key: "fatcaStatus",
          width,
        },
        {
          header: "GIIN No C(19)",
          key: "giinNo",
          width,
        },
        {
          header: "Optional Prefix Code C(3)",
          key: "optionalPrefixCode",
          width,
        },
        {
          header: "Optional Prefix Other C(30)",
          key: "optionalPrefixOther",
          width,
        },
        {
          header: "Optional First Name C(40)",
          key: "optionFirstName",
          width,
        },
        {
          header: "Optional Last Name/Company Name C(110)",
          key: "optionalLastname",
          width,
        },
      ],
    },
    dss3: {
      func: getOrderExport,
      columns: [
        {
          header: "Sequence No N(10.0)",
          key: "sequence",
          width,
        },
        {
          header: "Credit Participant ID C(3)",
          key: "brokerCode",
          width,
        },
        {
          header: "Credit Brokerage Account ID C(15)",
          key: "accountNo",
          width,
        },
        {
          header: "Credit Share Quantity N(18.0)",
          key: "volume",
          width,
        },
        {
          header: "Credit Pledge Brokerage Account ID C(15)",
          key: "creaditAccountId",
          width,
        },
        {
          header: "Pledge Share Quantity N(18.0)",
          key: "pledgeQuantity",
          width,
        },
      ],
    },
    refund: {
      func: getOverPaymet,
      columns: [
        {
          header: "Firstname",
          key: "firstname",
          width: 20,
        },
        {
          header: "Lastname",
          key: "lastname",
          width: 20,
        },
        {
          header: "accountId",
          key: "registrationNo",
          width: 20,
        },
        {
          header: "จำนวนหุ้นเดิม",
          key: "stockVolume",
          width: 20,
        },
        {
          header: "สัดส่วน",
          key: "proportion",
          width: 20,
        },
        {
          header: "จำนวนหุ้นจองทั้งหมด",
          key: "paidRightVolume",
          width: 20,
        },
        {
          header: "จำนวนที่จองซื้อตามสิทธิ์",
          key: "rightVolume",
          width: 20,
        },
        {
          header: "จำนวนที่จองเกินสิทธิ์",
          key: "moreThanRight",
          width: 20,
        },
        {
          header: "จำนวนหุ้นที่ได้รับการจัดสรรตามสิทธิ์",
          key: "volume",
          width: 20,
        },
        {
          header: "จำนวนหุ้นที่ได้รับการจัดสรรจริง",
          key: "actual",
          width: 20,
        },
        {
          header: "จำนวนหุ้นที่ไม่ได้รับการจัดสรร",
          key: "notAllocate",
          width: 20,
        },
        {
          header: "จำนวน W1 ที่ได้รับสิทธิ์",
          key: "wollance",
          width: 20,
        },
        {
          header: "ธนาคารที่โอนเงินคืน",
          key: "bankRefund",
          width: 20,
        },
        {
          header: "หมายเลขบัญชีเพื่อโอนเงินคืน",
          key: "bankRefundNo",
          width: 20,
        },
        {
          header: "ยอดโอนเงินคืน",
          key: "refundAmount",
          width: 20,
        },
      ],
    },
    letterCheck: {
      func: getOrderExport,
      columns: [
        {
          header: "Customer ID (เลขทะเบียนผู้ถือหุ้น)",
          key: "registrationNo",
          width: 20,
        },
        {
          header: "คำนำหน้าชื่อ",
          key: "title",
          width: 20,
        },
        {
          header: "ชื่อ",
          key: "name",
          width: 20,
        },
        {
          header: "นามสกุล",
          key: "lastname",
          width: 20,
        },
        {
          header: "ที่อยู่",
          key: "address",
          width: 20,
        },
        {
          header: "รหัสไปรษณีย์",
          key: "zipcode",
          width: 20,
        },
        {
          header: "เบอร์โทรศัพท์",
          key: "telephone",
          width: 20,
        },
        {
          header: "จำนวนที่จองซื้อตามสิทธิ (หุ้น)",
          key: "rightVolume",
          width: 20,
        },
        {
          header: "จำนวนที่จองเกินสิทธิ (หุ้น)",
          key: "moreThanVolume",
          width: 20,
        },
        {
          header: "จำนวนหุ้นที่ได้รับการจัดสรร (หุ้น)",
          key: "allVolume",
          width: 20,
        },
        {
          header: "จำนวนหุ้นที่ไม่ได้รับการจัดสรร (หุ้น)",
          key: "notAllocate",
          width: 20,
        },
        {
          header: "จำนวนเงินคืน",
          key: "refund",
          width: 20,
        },

        {
          header: "ชื่อธนาคารที่ออกเชค",
          key: "nameBankForCheck",
          width: 20,
        },
        {
          header: "เลขที่เช็ค",
          key: "noChek",
          width: 20,
        },
        { header: "BookBank image", key: "attachedFileBookBank", width: 20 },
        { header: "Slip image", key: "attachedFile", width: 20 },
      ],
    },
    letterAts: {
      func: getOrderExport,
      columns: [
        {
          header: "Customer ID (เลขทะเบียนผู้ถือหุ้น)",
          key: "registrationNo",
          width: 20,
        },
        {
          header: "คำนำหน้าชื่อ",
          key: "title",
          width: 20,
        },
        {
          header: "ชื่อ",
          key: "name",
          width: 20,
        },
        {
          header: "นามสกุล",
          key: "lastname",
          width: 20,
        },
        {
          header: "ที่อยู่",
          key: "address",
          width: 20,
        },
        {
          header: "รหัสไปรษณีย์",
          key: "zipcode",
          width: 20,
        },
        {
          header: "เบอร์โทรศัพท์",
          key: "telephone",
          width: 20,
        },
        {
          header: "จำนวนที่จองซื้อตามสิทธิ (หุ้น)",
          key: "rightVolume",
          width: 20,
        },
        {
          header: "จำนวนที่จองเกินสิทธิ (หุ้น)",
          key: "moreThanVolume",
          width: 20,
        },
        {
          header: "จำนวนหุ้นที่ได้รับการจัดสรร (หุ้น)",
          key: "allVolume",
          width: 20,
        },
        {
          header: "จำนวนหุ้นที่ไม่ได้รับการจัดสรร (หุ้น)",
          key: "notAllocate",
          width: 20,
        },
        {
          header: "จำนวนเงินคืน",
          key: "refund",
          width: 20,
        },
        {
          header: "Code Bank",
          key: "codeBank",
          width: 20,
        },
        {
          header: "ชื่อธนาคาร",
          key: "bankRefundName",
          width: 20,
        },
        {
          header: "เลขที่บัญชีธนาคาร",
          key: "bankRefundNo",
          width: 20,
        },
        { header: "BookBank image", key: "attachedFileBookBank", width: 20 },
        { header: "Slip image", key: "attachedFile", width: 20 },
      ],
    },
    pti: {
      func: getOrderExport,
      columns: [
        {
          header: "เลขที่ใบจอง / ลำดับที่",
          key: "subScriptionSequenceNo",
          width: 20,
        },
        {
          header: "ประเภทเลขอ้างอิง F",
          key: "refType",
          width: 20,
        },
        {
          header: "เลขที่บัตรประชาชน",
          key: "refNo",
          width: 20,
        },
        {
          header: "ประเภทบุคคล F",
          key: "holderType",
          width: 20,
        },
        {
          header: "รหัสคำนำหน้า",
          key: "titleCode",
          width: 20,
        },
        {
          header: "คำนำหน้านาม กรณีระบุรหัสเป็น '099' อื่นๆ",
          key: "",
          width: 20,
        },
        {
          header: "ชื้อผู้ถือหุ้น",
          key: "name",
          width: 20,
        },
        {
          header: "นามสกุลผู้ถือหุ้น/ชื่อบริษัท",
          key: "lastname",
          width: 20,
        },
        {
          header: "เพศผู้ถือหุ้น",
          key: "",
          width: 20,
        },
        {
          header: "ที่อยู่ผู้ถือหุ้น",
          key: "address",
          width: 20,
        },
        {
          header: "รหัสไปรษณีย์",
          key: "zipcode",
          width: 20,
        },
        {
          header: "โทรศัพท์บ้าน",
          key: "home",
          width: 20,
        },
        {
          header: "โทรศัพท์ที่ทำงาน",
          key: "office",
          width: 20,
        },
        {
          header: "โทรศัพท์มือถือ",
          key: "customerTel",
          width: 20,
        },
        {
          header: "โทรสาร",
          key: "fax",
          width: 20,
        },
        { header: "Email", key: "email", width: 20 },
        { header: "รหัสประเทศ F", key: "", width: 20 },
        { header: "สัญชาติผู้ถือหุ้น F", key: "nationalityCode", width: 20 },
        { header: "รหัสอาชีพผู้ถือหุ้น", key: "occupationCode", width: 20 },
        { header: "วันเกิดผู้ถือหุ้น", key: "", width: 20 },
        { header: "เลขประจำตัวผู้เสียภาษี", key: "taxId", width: 20 },
        {
          header: "การหักภาษี ณ ที่จ่าย",
          key: "withHoldingTaxType",
          width: 20,
        },
        { header: "วิธีการรับเอกสาร", key: "", width: 20 },
        { header: "สถานะการอายัดการกระจายหุ้น", key: "", width: 20 },
        { header: "ประเภทการถือครองหุ้น", key: "", width: 20 },
        {
          header: "จำนวนหลักทรัพย์ที่จองซื้อ (IPO Allotment)",
          key: "paidRightVolume",
          width: 20,
        },
        {
          header:
            "เลขที่สมาชิกศูนย์รับฝากสำหรับการฝากเข้าบัญชีสมาชิกศูนย์รับฝาก",
          key: "partiNo",
          width: 20,
        },
        {
          header:
            "เลขที่อ้างอิงระหว่างผู้ถือหุ้นกับสมาชิกศูนย์รับฝาก สำหรับการฝากเข้าบัญชีสมาชิกศูนย์รับฝาก",
          key: "brokerateAccount",
          width: 20,
        },
        {
          header:
            "ระบุเลขที่อ้างอิงระหว่างผู้ถือหุ้นกับสมาชิกศูนย์รับฝากฯสำหรับกรณีจำนำ",
          key: "",
          width: 20,
        },
        {
          header: "รหัสพนักงาน",
          key: "",
          width: 20,
        },
        {
          header: "รหัสฝ่ายงาน",
          key: "",
          width: 20,
        },
        {
          header: "เลขที่ใบหุ้นเดิมสำหรับกรณี NR เท่านั้น",
          key: "",
          width: 20,
        },
        {
          header: "US Indicia",
          key: "",
          width: 20,
        },
        {
          header: "Entity Type",
          key: "",
          width: 20,
        },
        {
          header: "GIIN No",
          key: "giinNo",
          width: 20,
        },

        {
          header: "รหัสคำนำหน้า",
          key: "",
          width: 20,
        },
        {
          header: "คำนำหน้านาม",
          key: "",
          width: 20,
        },
        {
          header: "ชื่อผู้ถือหุ้น",
          key: "",
          width: 20,
        },
        {
          header: "นามสกุล/ชื่อบริษัทต้องเป็นภาษาอังกฤษเท่านั้น",
          key: "",
          width: 20,
        },
      ],
    },
  };

  const select = await excelHandler[key as string];

  const { func, columns } = select;

  sheet.columns = columns;

  const data = await func(key);

  sheet.addRows(data);

  // * Set border header
  const rowHeaders = sheet.getRows(1, 1);

  for (const row of rowHeaders || []) {
    row.eachCell({ includeEmpty: true }, function (cell, rowNumber) {
      cell.font = { size: 10, bold: true };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  }

  // * Set border data
  const rowData = sheet.getRows(2, data.length);

  for (const row of rowData || []) {
    row.eachCell({ includeEmpty: true }, function (cell, rowNumber) {
      cell.font = { size: 9 };

      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  }

  sheet.autoFilter = {
    from: "A1",
    to: "Z24",
  };

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  res.setHeader(
    "Content-Disposition",
    "attachment; filename=" + `${filename}.xlsx`
  );

  return workbook.xlsx.write(res).then(function () {
    res.status(200).end();
  });
}

export async function exportText(obj: any) {
  const { key, filename, res } = obj;

  const excelHandler: { [key: string]: any } = {
    atsSba: {
      func: getAtsTxt,
    },
    dss: {
      func: getDssTxt,
    },
    dss1: {
      func: getDss1Txt,
    },
    dss3: { func: getDss3Txt },
    pti: {
      func: getPtiText,
    },
  };

  const select = await excelHandler[key as string];

  const { func } = select;

  const data = await func(key);

  let value = "";
  for (const obj of data) {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const element = obj[key];
        value += `${element}|`;
      }
    }

    value += "\n";
  }

  res.attachment(`${filename}.txt`);
  res.type("txt");
  res.send(value);
}

// * Export function bank
export async function getFromBank() {
  const data = await getOrderExport();
}

// * Export data
export async function getOrderExport(type?: string) {
  let orderCalculate: any;
  if (type === "dss1" || type === "dss3") {
    orderCalculate = await getOverPaymet();
  }

  const sort = {
    $sort: {
      createdOn: -1,
    },
  };

  const find = await getDataWithPaging(
    null,
    1,
    100000000,
    sort,
    OrderModel,
    "order"
  );

  const { data } = find;

  let runningNumber = 213000001;

  let response: any[] = [];
  const exportDate = new Date();
  let sequenceNo = 1;
  for (const obj of data) {
    const {
      _id,
      customerId,
      rightStockName,
      stockVolume,
      rightSpecialName,
      customerStock,
      rightSpecialVolume,
      paidRightVolume,
      paidSpecialVolume,
      paymentAmount,
      returnAmount,
      excessAmount,
      paymentDate,
      bankRefund,
      bankRefundNo,
      status,
      createdOn,
      approvedOn,
      brokerId,
      isCert,
      accountNo,
      sequence,
      totalAllot,
      rightVolume,
      moreThanVolume,
      allVolume,
      warrantList,
      attachedFileBookBank,
      attachedFile,
      allocateDetail,
      customerTel,
    } = obj;

    // * collection master customer
    const {
      id,
      name,
      lastname,
      nationalId,
      telephone,
      atsBank,
      atsBankNo,
      refNo,
      zipcode,
      holderType,
      address,
      title,
      home,
      office,
      fax,
      email,
      nationalityCode,
      occupationCode,
      taxId,
      titleCode,
    } = customerId;

    // * collection customer stock
    const {
      registrationNo,
      rightStockVolume,
      refType,
      offerPrice,
      getRight,
      ratio,
      subScriptionNo,
      withHoldingTaxType,
      partiNo,
      brokerateAccount,
    } = customerStock;

    const { code } = brokerId || {};

    // * collection master bank
    const { nameTH, codeBank } = bankRefund || {};

    // * collection status
    let tempAllow = paymentAmount - excessAmount;

    let resultVolume;
    let total = 0;

    if (type === "dss1" || type === "dss3") {
      const test = orderCalculate.filter(
        (o: any) => o.orderId === _id.toString()
      );

      const { volume, equalRight } = test[0] || {};

      total = totalAllot;
      resultVolume = volume;
    }

    const notAllocate = (paidRightVolume || 0) - (allVolume || 0);

    // * 1 = ฝากหุ้นที่ได้รับการจัดสรรไว้ที่หมายเลขสมาชิก // * 2 = รับใบหุ้น // * 3 = บัญชีสมาชิกเลขที่ 600 เพิ่มข้าพเจ้า
    // * Condition Quamtily of subscribed scrip n

    let cert = undefined;

    if (allocateDetail && allocateDetail.type === 2 && type !== "dss3") {
      // * (ยอด sum ตามสิทธิ+เกินสิทธิ)
      cert = paidRightVolume + excessAmount;
    }

    // * Quantity of Subscribed Issuer Account

    let quantityIssuerAccount = undefined;

    if (allocateDetail && allocateDetail.type === 3 && type !== "dss3") {
      quantityIssuerAccount = paidRightVolume + excessAmount;
    }

    // * Quantity of Subscribed Participant's Account

    let volume = undefined;

    if (allocateDetail && allocateDetail.type === 1 && type === "dss3") {
      volume = paidRightVolume + excessAmount;
    }

    response.push({
      subScriptionSequenceNo: runningNumber++,
      customerId: refNo,
      customerName: name,
      customerLastname: lastname,
      customerNationalId: refNo,
      telephone,
      address,
      atsBank,
      atsBankNo,
      rightStockName,
      stockVolume,
      rightSpecialName,
      rightStockVolume,
      rightSpecialVolume,
      paidRightVolume,
      paidSpecialVolume,
      paymentAmount,
      returnAmount: excessAmount,
      allowedAmount: tempAllow < 0 ? tempAllow * -1 : tempAllow,
      paymentDate: paymentDate ? format(paymentDate, "dd/MM/yyyy") : "",
      paymentTime: paymentDate ? format(paymentDate, "HH:mm:ss") : "",
      status: status.status,
      bankRefundName: nameTH,
      bankRefundNo,
      exportDate: exportDate ? format(exportDate, "dd/MM/yyyy") : "",
      exportTime: exportDate ? format(exportDate, "HH:mm:ss") : "",
      registrationNo,
      refType,
      refNo,
      titleCode,
      title,
      name,
      lastname,
      zipcode,
      offerPrice,
      ratio: `${getRight} : ${ratio}`,
      holderType,
      createdOn: format(createdOn, "dd/MM/yyyy HH:mm:ss"),
      approvedOn: approvedOn ? format(approvedOn, "dd/MM/yyyy HH:mm:ss") : "",
      brokerCode: code,
      brokerName: brokerId ? brokerId.name : "",
      cert,
      atsCert: isCert ? "yes" : "no",
      fixName: "NCAP",
      marketId: "A",
      sequence,
      actionType: "E",
      transactionDate: "",
      transactionNo: "",
      subscription: "",
      certificateId: "",
      slipTransactionDate: "",
      slipTransactionNo: "",
      quantityIssuerAccount,
      volume,
      chequePoolFlag: "N", //+total > 0 ? "N" : "",
      bankCodeReturnCash: "",
      bankAccountReturnCash: "",
      usIndiciaFlag: quantityIssuerAccount > 0 ? "N" : "",
      entityTypeCode: "",
      fatcaStatus: "",
      giinNo: "",
      optionalPrefixCode: "",
      optionalPrefixOther: "",
      optionFirstName: "",
      optionalLastname: "",
      subScriptionNo: subScriptionNo || "000000000",
      creaditAccountId: "",
      pledgeQuantity: "",
      accountNo,
      isCert,
      rightVolume, // * จำนวนที่จองซื้อตามสิทธิ
      moreThanVolume, // * จำนวนที่จองเกินสิทธิ
      allVolume, // * จำนวนหุ้นที่ได้รับการจัดสรร
      warrantList,
      notAllocate, // * จำนวนหุ้นที่ไม่ได้รับการจัดสรร
      refund: notAllocate * offerPrice,
      codeBank,
      nameBankForCheck: "", // * ชื่อธนาคารที่ออกเชค
      noChek: "", // * เลขที่เช็ค
      attachedFileBookBank,
      attachedFile,
      home,
      office,
      customerTel,
      fax,
      nationalityCode,
      occupationCode,
      taxId,
      withHoldingTaxType,
      partiNo,
      brokerateAccount,
    });

    sequenceNo++;
  }

  if (type === "dss3") {
    return response.filter((o) => o.isCert !== true && o.brokerCode !== "000");
  }

  return response;
}

export async function getAtsTxt() {
  const data = await getOrderExport();

  let response: any[] = [];

  for (const obj of data) {
    const {
      account,
      bankCode,
      dueDate,
      receiveType,
      bankRefundNo,
      customerName,
      paymentAmount,
      id,
      delFlag,
      exportDate,
      exportNo,
      exportTime,
      authorUser,
      authorUserId,
      exportGroupNo,
      groupDate,
    } = obj;
    response.push({
      account: account || "",
      bankCode: bankCode || "",
      dueDate: dueDate || "",
      receiveType: receiveType || "",
      bankRefundNo: bankRefundNo || "",
      customerName: customerName || "",
      paymentAmount: paymentAmount || "",
      id: id || "",
      delFlag: delFlag || "",
      exportDate: exportDate || "",
      exportNo: exportNo || "",
      exportTime: exportTime || "",
      authorUser: authorUser || "",
      authorUserId: authorUserId || "",
      exportGroupNo: exportGroupNo || "",
      groupDate: groupDate || "",
    });
  }

  return response;
}

export async function getDssTxt() {
  const data = await getOrderExport();

  let response: any[] = [];

  for (const obj of data) {
    const {
      transaction,
      rightStockName,
      bookCloseDate,
      recordDate,
      marketId,
      subscriptionm,
      registrationNo,
      refType,
      customerNationalId,
      titleCode,
      title,
      name,
      lastname,
      address,
      zipcode,
      countryAbbr,
      nationality,
      holderType,
      numberOfShareBookClose,
      numberOfRightSub,
      amount,
      offerPrice,
      ratio,
    } = obj;
    response.push({
      transaction: transaction || "",
      rightStockName: rightStockName || "",
      bookCloseDate: bookCloseDate || "",
      recordDate: recordDate || "",
      marketId: marketId || "",
      subscriptionm: subscriptionm || "",
      registrationNo: registrationNo || "",
      refType: refType || "",
      customerNationalId: customerNationalId || "",
      titleCode: titleCode || "",
      title: title || "",
      name: name || "",
      lastname: lastname || "",
      address: address || "",
      zipcode: zipcode || "",
      countryAbbr: countryAbbr || "",
      nationality: nationality || "",
      holderType: holderType || "",
      numberOfShareBookClose: numberOfShareBookClose || "",
      numberOfRightSub: numberOfRightSub || "",
      amount: amount || "",
      offerPrice: offerPrice || "",
      ratio: ratio || "",
    });
  }

  return response;
}

export async function getDss1Txt(type?: string) {
  const data = await getOrderExport(type);

  let response: any[] = [];

  for (const obj of data) {
    const {
      fixName,
      marketId,
      sequenceNo,
      actionType,
      transactionDate,
      transactionNo,
      subScriptionNo,
      registrationNo,
      certificateId,
      slipTransactionDate,
      slipTransactionNo,
      cert,
      quantityIssuerAccount,
      volume,
      chequePoolFlag,
      bankCodeReturnCash,
      bankAccountReturnCash,
      usIndiciaFlag,
      entityTypeCode,
      fatcaStatus,
      giinNo,
      optionalPrefixCode,
      optionalPrefixOther,
      optionFirstName,
      optionalLastname,
    } = obj;
    response.push({
      fixName,
      marketId,
      sequenceNo,
      actionType,
      transactionDate,
      transactionNo,
      subScriptionNo,
      registrationNo,
      certificateId,
      slipTransactionDate,
      slipTransactionNo,
      cert,
      quantityIssuerAccount,
      volume,
      chequePoolFlag,
      bankCodeReturnCash,
      bankAccountReturnCash,
      usIndiciaFlag,
      entityTypeCode,
      fatcaStatus,
      giinNo,
      optionalPrefixCode,
      optionalPrefixOther,
      optionFirstName,
      optionalLastname,
    });
  }

  return response;
}

export async function getDss3Txt(type?: string) {
  const data = await getOrderExport(type);

  let response: any[] = [];

  for (const obj of data) {
    const {
      sequenceNo,
      brokerCode,
      accountNo,
      volume,
      creaditAccountId,
      pledgeQuantity,
    } = obj;
    response.push({
      sequenceNo,
      brokerCode,
      accountNo,
      volume,
      creaditAccountId,
      pledgeQuantity,
    });
  }

  return response;
}

export async function getPtiText() {
  const data = await getOrderExport("");

  let response: any[] = [];

  for (const obj of data) {
    response.push({
      subScriptionSequenceNo: obj.subScriptionSequenceNo,
      refType: obj.refType,
      refNo: obj.refNo,
      holderType: obj.holderType,
      titleCode: obj.titleCode,
      not2: "", // * คำนำหน้านาม กรณีระบุรหัสเป็น '099' อื่นๆ
      name: obj.name,
      lastname: obj.lastname,
      not3: "", // * เพศผู้ถือหุ้น
      address: obj.address,
      zipcode: obj.zipcode,
      home: obj.home,
      office: obj.office,
      customerTel: obj.customerTel,
      fax: obj.fax,
      email: obj.email,
      not4: "", // * รหัสประเทศ F
      nationalityCode: obj.nationalityCode,
      occupationCode: obj.occupationCode,
      not5: "", // * วันเกิดผู้ถือหุ้น
      taxId: obj.taxId,
      withHoldingTaxType: obj.withHoldingTaxType,
      not6: "", // * วิธีการรับเอกสาร
      not7: "", // * สถานะการอายัดการกระจายหุ้น
      not77: "", // * สถานะการอายัดการกระจายหุ้น
      paidRightVolume: obj.paidRightVolume,
      partiNo: obj.partiNo,
      brokerateAccount: obj.brokerateAccount,
      not8: "", // * ระบุเลขที่อ้างอิงระหว่างผู้ถือหุ้นกับสมาชิกศูนย์รับฝากฯสำหรับกรณีจำนำ
      not9: "", // * รหัสพนักงาน
      not10: "", // * รหัสฝ่ายงาน
      not11: "", // * เลขที่ใบหุ้นเดิมสำหรับกรณี NR เท่านั้น
      not12: "", // * US Indicia
      not13: "", // * Entity Type
      giinNo: obj.giinNo,
      not14: "", // * รหัสคำนำหน้า
      not15: "", // * คำนำหน้านาม
      not16: "", // * ชื่อผู้ถือหุ้น
      not17: "", // * นามสกุล/ชื่อบริษัทต้องเป็นภาษาอังกฤษเท่านั้น
    });
  }

  return response;
}
