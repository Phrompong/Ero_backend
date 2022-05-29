import { WorkBook } from "xlsx";
import { Order, OrderModel } from "../models/order.model";
import { getDataWithPaging } from "./common.controller";
import * as excelJS from "exceljs";
import { forEach } from "lodash";
import { format } from "date-fns";

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
          key: "customerId",
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
        { header: "ธนาคารสำหรับคืนเงิน", key: "bankRefundName", width: 20 },
        {
          header: "เลขบัญชีธนาคารสำหรับคืนเงิน",
          key: "bankRefundNo",
          width: 20,
        },
        { header: "ที่อยู่", key: "address", width: 20 },
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
          key: "",
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
      ],
    },
  };

  const select = await excelHandler[key as string];

  const { func, columns } = select;

  sheet.columns = columns;

  const data = await func();

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
  };

  const select = await excelHandler[key as string];

  const { func } = select;

  const data = await func();

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
export async function getOrderExport() {
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
  for (const obj of data) {
    const {
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
      address,
      status,
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
      registrationNo,
      zipcode,
      holderType,
    } = customerId;

    // * collection customer stock
    const {
      rightStockVolume,
      refType,
      titleCode,
      title,
      offerPrice,
      getRight,
      ratio,
    } = customerStock;

    // * collection master bank
    const { nameTH } = bankRefund;

    // * collection status

    let tempAllow = paymentAmount - excessAmount;

    response.push({
      customerId: refNo,
      customerName: name,
      customerLastname: lastname,
      customerNationalId: refNo,
      telephone,
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
      address,
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
    });
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
