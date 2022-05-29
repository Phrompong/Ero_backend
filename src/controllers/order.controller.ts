import { WorkBook } from "xlsx";
import { Order, OrderModel } from "../models/order.model";
import { getDataWithPaging } from "./common.controller";
import * as excelJS from "exceljs";
import { forEach } from "lodash";

export async function insert(order: Order) {
  if (!order) {
    return;
  }

  const result = await OrderModel.create(order);

  return result;
}

// * Export data
export async function dataExport() {
  const sort = {
    $sort: {
      createdOn: -1,
    },
  };

  const find = await getDataWithPaging(
    null,
    1,
    1000000,
    sort,
    OrderModel,
    "order"
  );

  const { data } = find;

  let response: any[] = [];

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
    } = obj;

    const {
      id,
      name,
      lastname,
      nationalId,
      telephone,
      atsBank,
      atsBankNo,
      refNo,
    } = customerId;

    const { rightStockVolume } = customerStock;

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
    });
  }

  return response;
}

export async function exportExcel(obj: any) {
  const { key, res, filename, sheetname } = obj;

  const workbook = new excelJS.Workbook();
  let sheet = workbook.addWorksheet(sheetname || "ERO");
  const width = 20;

  const excelHandler: { [key: string]: any } = {
    atsSba: {
      func: {},
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
          key: "",
          width,
        },
        {
          header: "CustName",
          key: "",
          width,
        },
        {
          header: "Price",
          key: "",
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
          key: "",
          width,
        },
        {
          header: "ExportNo",
          key: "",
          width,
        },
        {
          header: "ExportTime",
          key: "",
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
          key: "",
          width,
        },
      ],
    },
    dss: {
      func: {},
      columns: [
        {
          header: "Transaction Type of Corporate Action",
          key: "",
          width,
        },
        {
          header: "Securities Symbol at",
          key: "",
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
          key: "",
          width,
        },
        {
          header: "Reference Type",
          key: "",
          width,
        },
        {
          header: "Reference No",
          key: "",
          width,
        },
        {
          header: "Prefix",
          key: "",
          width,
        },
        {
          header: "Official Prefix",
          key: "",
          width,
        },
        {
          header: "Official First Name",
          key: "",
          width,
        },
        {
          header: "Official Last Name",
          key: "",
          width,
        },
        {
          header: "Address",
          key: "",
          width,
        },
        {
          header: "Zip Code",
          key: "",
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
          key: "",
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
          key: "",
          width,
        },
        {
          header: "Subscription / Exercise Ratio",
          key: "",
          width,
        },
      ],
    },
    other: {
      func: dataExport,
      columns: [
        {
          header: "Customer ID",
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
