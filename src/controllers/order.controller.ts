import { WorkBook } from "xlsx";
import { Order, OrderModel } from "../models/order.model";
import { getDataWithPaging } from "./common.controller";
import * as excelJS from "exceljs";
import { forEach } from "lodash";
import { format } from "date-fns";
import { getOverPaymet } from "./overPayment.controller";

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
        { header: "ใบจองหุ้น", key: "cert", width: 20 },
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
      ],
    },
    letterAts: {
      func: getOrderExport,
      columns: [
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
    } = customerId;

    // * collection customer stock
    const {
      registrationNo,
      rightStockVolume,
      refType,
      titleCode,
      offerPrice,
      getRight,
      ratio,
      subScriptionNo,
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

    const quantityIssuerAccount = code === "000" ? total : 0;

    const notAllocate = (paidRightVolume || 0) - (allVolume || 0);

    response.push({
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
      cert: isCert ? total : 0,
      atsCert: isCert ? "มีใบหุ้น" : 0,
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
      volume: !isCert && code !== 600 ? total : 0,
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
