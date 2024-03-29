import { mongoose } from "@typegoose/typegoose";
import ld, { filter, isEmpty as _isEmpty } from "lodash";
import { OrderModel } from "../models/order.model";
import { SchemaType } from "mongoose";
import { CustomerStockModel } from "../models/customer.stock.model";
import zlib from "zlib";

function getDatabaseModelFields(schemaModel: unknown): Record<string, string> {
  if (!(typeof schemaModel === "function" && schemaModel.name === "model")) {
    throw Error("input is not a Model");
  }

  let mainPaths: {
    [key: string]: SchemaType;
  } = {};

  mainPaths = (schemaModel as any).schema.paths;

  function getFields(paths: any) {
    const tmp: Record<string, string> = {};

    for (const key in paths) {
      if (Object.prototype.hasOwnProperty.call(paths, key)) {
        const path = paths[key] as any;
        const instance = path.instance;

        // * Check if path has a sub document
        if (
          (path.$isMongooseArray && path.$isMongooseDocumentArray) ||
          path.$isSingleNested
        ) {
          tmp[key] = instance;
          const subFields = getFields(path.schema.paths);

          for (const field in subFields) {
            if (!Object.prototype.hasOwnProperty.call(subFields, field)) {
              continue;
            }

            tmp[`${key}.${field}`] = subFields[field];
          }
        } else if (path.$isMongooseArray) {
          tmp[key] = `${path.$embeddedSchemaType.instance}[]`;
        } else {
          tmp[key] = instance;
        }
      }
    }

    return tmp;
  }

  return getFields(mainPaths);
}

export function mutateQueryFilters(
  schema: unknown,
  filters: unknown,
  pre?: string
): any {
  const SCHEMATYPE_MISMATCH_ERROR =
    "Value of property to filter does not match schema type";

  const rules: Record<string, string[]> = {
    $gt: ["Number", "Date"],
    $gte: ["Number", "Date"],
    $lt: ["Number", "Date"],
    $lte: ["Number", "Date"],
    $eq: ["String", "ObjectID", "Number", "Boolean"],
    $ne: ["String", "ObjectID", "Number", "Boolean"],
    $in: [
      "String",
      "ObjectID",
      "Number",
      "Boolean",
      "String[]",
      "ObjectID[]",
      "Number[]",
    ],
    $nin: [
      "String",
      "ObjectID",
      "Number",
      "Boolean",
      "String[]",
      "ObjectID[]",
      "Number[]",
    ],
    $regex: ["String"],
  };

  const _filters: any = ld.cloneDeep(filters);
  const fields = getDatabaseModelFields(schema);

  for (const field in _filters) {
    let _field = field;

    if (!Object.prototype.hasOwnProperty.call(_filters, _field)) {
      continue;
    }

    if (_field === "$and" || _field === "$or") {
      _filters[_field] = _filters[_field].map((f: any) => {
        return mutateQueryFilters(schema, f, pre);
      });

      continue;
    }

    if (pre) {
      _field = `${pre}.${field}`;
    }

    // * Get variables for validation
    const schemaFieldType = fields[_field];
    const operator = Object.keys(_filters[field])[0];
    const filterValue = _filters[field][operator];
    let typeOfFilterValue: any = typeof filterValue;
    if (typeof filterValue === "object" && Array.isArray(filterValue)) {
      typeOfFilterValue = "array";
    }

    const rule = rules[operator];

    // * Check if field to filter exists in schema
    if (!schemaFieldType) {
      throw new Error(`Field [${_field}] does not exist in schema`);
    }

    // * Check if operator exists
    if (!rule) {
      throw new Error(`Unknown operator ${operator}`);
    }

    // * Reject if not using arrays with $in or $nin
    if (!rule.includes(schemaFieldType)) {
      throw new Error(
        `${_field} type cannot be used with operator ${operator}`
      );
    }

    if (
      (operator === "$in" || operator === "$nin") &&
      typeOfFilterValue !== "array"
    ) {
      throw new Error(`${operator} only accepts array values`);
    }

    _field = field;
    // * Validate type of value
    switch (schemaFieldType) {
      case "String":
      case "String[]":
        if (typeOfFilterValue === "array") {
          for (const value of filterValue) {
            if (typeof value !== "string")
              throw new Error(SCHEMATYPE_MISMATCH_ERROR);
          }
        } else if (typeOfFilterValue !== "string") {
          throw new Error(SCHEMATYPE_MISMATCH_ERROR);
        } else if (operator === "$regex") {
          _filters[_field][operator] = new RegExp(filterValue);
        }
        break;
      case "Number":
      case "Number[]":
        if (typeOfFilterValue === "array") {
          for (const value of filterValue) {
            if (typeof value !== "number")
              throw new Error(SCHEMATYPE_MISMATCH_ERROR);
          }
        } else if (typeOfFilterValue !== "number") {
          throw new Error(SCHEMATYPE_MISMATCH_ERROR);
        }

        break;
      case "Boolean":
        if (typeOfFilterValue === "array") {
          for (const value of filterValue) {
            if (typeof value !== "boolean")
              throw new Error(SCHEMATYPE_MISMATCH_ERROR);
          }
        } else if (typeOfFilterValue !== "boolean") {
          throw new Error(SCHEMATYPE_MISMATCH_ERROR);
        }
        break;
      case "Date":
        if (typeOfFilterValue !== "string") {
          throw new Error(SCHEMATYPE_MISMATCH_ERROR);
        }

        _filters[_field] = {
          [operator]: new Date(filterValue),
        };
        break;
      case "ObjectID":
      case "ObjectID[]":
        if (typeOfFilterValue === "array") {
          const newFilterValue = filterValue.map((value: any) => {
            if (!mongoose.isValidObjectId(value)) {
              throw new Error(SCHEMATYPE_MISMATCH_ERROR);
            }

            //return new mongoose.Types.ObjectId(value);
          }, []);

          _filters[_field] = {
            [operator]: newFilterValue,
          };
        } else if (!mongoose.isValidObjectId(filterValue)) {
          throw new Error(SCHEMATYPE_MISMATCH_ERROR);
        } else {
          //_filters[_field][operator] = new mongoose.Types.ObjectId(filterValue);
        }

        break;
      default:
        throw new Error(
          `Schema field type ${schemaFieldType} unknown or not yet supported`
        );
    }
  }

  return _filters;
}

export async function getDataWithPaging(
  filter: any,
  pageInput: number,
  limitInput: number,
  sort: unknown,
  Model: any,
  mode?: string,
  key?: string,
  startDate?: Date | undefined,
  endDate?: Date | undefined
): Promise<any> {
  let match = { $match: {} };

  if (filter) {
    match = { $match: mutateQueryFilters(Model, filter) };
  }

  const skip = { $skip: pageInput * limitInput - limitInput };
  const pageSize = { $limit: limitInput || 10 };
  const count = { $count: "total" };

  let toFacet;
  let request: any[] = [];

  switch (mode) {
    case "order":
    case "orderSearch":
      request = [
        match,
        sort,
        {
          $lookup: {
            from: "cltMasterCustomer",
            localField: "customerId",
            foreignField: "_id",
            as: "customerId",
          },
        },
        {
          $lookup: {
            from: "cltStatus",
            localField: "status",
            foreignField: "_id",
            as: "status",
          },
        },
        {
          $lookup: {
            from: "cltCustomerStock",
            localField: "customerStockId",
            foreignField: "_id",
            as: "customerStock",
          },
        },
        {
          $lookup: {
            from: "cltMasterBanks",
            localField: "bankRefund",
            foreignField: "_id",
            as: "bankRefund",
          },
        },
        {
          $lookup: {
            from: "cltMasterBrokers",
            localField: "brokerId",
            foreignField: "_id",
            as: "brokerId",
          },
        },
        {
          $unwind: {
            path: "$brokerId",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$customerStock",
          },
        },
        {
          $unwind: {
            path: "$customerId",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$status",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$bankRefund",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            name: {
              $concat: ["$customerId.name", " ", "$customerId.lastname"],
            },
            customerId: 1,
            rightStockName: 1,
            stockVolume: 1,
            rightSpacialName: 1,
            rightSpacialVolume: 1,
            paidRightVolume: 1,
            paymentAmount: 1,
            returnAmount: 1,
            status: 1,
            createdOn: 1,
            createdBy: 1,
            updatedOn: 1,
            updatedBy: 1,
            attachedFile: 1,
            attachedOn: 1,
            excessAmount: 1,
            customerStock: 1,
            customerTel: 1,
            bankRefund: 1,
            bankRefundNo: 1,
            address: 1,
            paymentDate: 1,
            approvedOn: 1,
            brokerId: 1,
            isCert: 1,
            accountNo: 1,
            sequence: 1,
            totalAllot: 1,
            rightVolume: 1,
            moreThanVolume: 1,
            allVolume: 1,
            warrantList: 1,
            attachedFileBookBank: 1,
            netCustomerReceipt: 1,
            attachedFiles: 1,
            depositAmount: 1,
            allocateDetail: 1,
          },
        },
        {
          $project: {
            name: {
              $toLower: "$name",
            },
            tempRightStockName: {
              $toLower: "$rightStockName",
            },
            customerId: 1,
            rightStockName: 1,
            stockVolume: 1,
            rightSpacialName: 1,
            rightSpacialVolume: 1,
            paidRightVolume: 1,
            paymentAmount: 1,
            returnAmount: 1,
            status: 1,
            createdOn: 1,
            createdBy: 1,
            updatedOn: 1,
            updatedBy: 1,
            attachedFile: 1,
            attachedOn: 1,
            excessAmount: 1,
            customerStock: 1,
            customerTel: 1,
            bankRefund: 1,
            bankRefundNo: 1,
            address: 1,
            paymentDate: 1,
            approvedOn: 1,
            brokerId: 1,
            isCert: 1,
            accountNo: 1,
            sequence: 1,
            totalAllot: 1,
            rightVolume: 1,
            moreThanVolume: 1,
            allVolume: 1,
            warrantList: 1,
            attachedFileBookBank: 1,
            netCustomerReceipt: 1,
            attachedFiles: 1,
            depositAmount: 1,
            allocateDetail: 1,
          },
        },
        {
          $match: {
            $and: [
              key
                ? {
                    $or: [
                      {
                        name: new RegExp(key || ""),
                      },
                      {
                        "customerId.refNo": new RegExp(key || ""),
                      },
                      {
                        tempRightStockName: new RegExp(key || ""),
                      },
                      {
                        "customerId.nationalId": new RegExp(key || ""),
                      },
                      {
                        "customerId.taxId": new RegExp(key || ""),
                      },
                      {
                        "customerId.refNo": new RegExp(key || ""),
                      },
                      {
                        "customerStock.registrationNo": new RegExp(key || ""),
                      },
                    ],
                  }
                : {},
              startDate && endDate
                ? {
                    createdOn: {
                      $gte: startDate,
                      $lt: endDate,
                    },
                  }
                : {},
            ],
          },
        },
        {
          $project: {
            customerId: 1,
            rightStockName: 1,
            stockVolume: 1,
            rightSpacialName: 1,
            rightSpacialVolume: 1,
            paidRightVolume: 1,
            paymentAmount: 1,
            returnAmount: 1,
            status: 1,
            createdOn: 1,
            createdBy: 1,
            updatedOn: 1,
            updatedBy: 1,
            attachedFile: 1,
            attachedOn: 1,
            excessAmount: 1,
            customerStock: 1,
            customerTel: 1,
            bankRefund: 1,
            bankRefundNo: 1,
            address: 1,
            paymentDate: 1,
            approvedOn: 1,
            brokerId: 1,
            isCert: 1,
            accountNo: 1,
            sequence: 1,
            totalAllot: 1,
            rightVolume: 1,
            moreThanVolume: 1,
            allVolume: 1,
            warrantList: 1,
            attachedFileBookBank: 1,
            netCustomerReceipt: 1,
            attachedFiles: 1,
            depositAmount: 1,
            allocateDetail: 1,
          },
        },
      ];

      break;
    case "customer":
    case "customerStockSearch":
      request = [
        match,
        sort,
        {
          $lookup: {
            from: "cltMasterCustomer",
            localField: "customerId",
            foreignField: "_id",
            as: "customers",
          },
        },
        {
          $lookup: {
            from: "cltOrders",
            localField: "_id",
            foreignField: "customerStockId",
            as: "orders",
          },
        },
        {
          $unwind: {
            path: "$orders",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "cltMasterBrokers",
            localField: "orders.brokerId",
            foreignField: "_id",
            as: "orders.brokerId",
          },
        },
        {
          $unwind: {
            path: "$orders.brokerId",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "cltMasterBanks",
            localField: "orders.bankRefund",
            foreignField: "_id",
            as: "orders.bankRefund",
          },
        },
        {
          $unwind: {
            path: "$orders.bankRefund",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "cltStatus",
            localField: "orders.status",
            foreignField: "_id",
            as: "status",
          },
        },
        {
          $unwind: {
            path: "$customers",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            keyFullname: {
              $concat: ["$customers.name", " ", "$customers.lastname"],
            },
            keyRegistrationNo: "$registrationNo",
            keyNationalId: "$customers.nationalId",
            keyTaxId: "$customers.taxId",
            keyRefNo: "$customers.refNo",
          },
        },
        {
          $match: {
            $and: [
              key
                ? {
                    $or: [
                      {
                        keyFullname: new RegExp(key || ""),
                      },
                      {
                        keyRegistrationNo: new RegExp(key || ""),
                      },
                      {
                        keyNationalId: new RegExp(key || ""),
                      },
                      {
                        keyTaxId: new RegExp(key || ""),
                      },
                      {
                        keyRefNo: new RegExp(key || ""),
                      },
                    ],
                  }
                : {},
            ],
          },
        },
      ];

      break;
  }

  const dataPipeline = request;

  let _metadataPipeline = [{ $match: {} }];

  if (key) _metadataPipeline = [...request];

  dataPipeline.push(skip);
  dataPipeline.push(pageSize);

  const find = await Model.aggregate([
    {
      $facet: {
        _metadata: _metadataPipeline,
        data: dataPipeline,
      },
    },
  ]);

  if (find[0].data.length === 0) {
    if (pageInput > 1) {
      return false;
    }

    return {
      _metadata: {
        pageSize: limitInput,
        pageInput,
        totalPages: 1,
      },
      data: find[0].data,
    };
  }

  const total = key ? find[0]._metadata[0].total : await Model.find().count();
  const totalPages = Math.floor(total / limitInput);

  return {
    _metadata: {
      // total,
      pageSize: limitInput,
      pageInput,
      totalPages,
    },
    data: find[0].data,
  };
}

export async function getCurrentOrderAmount(
  key: string,
  startDate?: Date,
  endDate?: Date
) {
  const results = await OrderModel.aggregate([
    {
      $lookup: {
        from: "cltMasterCustomer",
        localField: "customerId",
        foreignField: "_id",
        as: "customerId",
      },
    },
    {
      $lookup: {
        from: "cltStatus",
        localField: "status",
        foreignField: "_id",
        as: "status",
      },
    },
    {
      $unwind: {
        path: "$customerId",
      },
    },
    {
      $unwind: {
        path: "$status",
      },
    },
    {
      $project: {
        name: {
          $concat: ["$customerId.name", " ", "$customerId.lastname"],
        },
        customerId: 1,
        rightStockName: 1,
        stockVolume: 1,
        rightSpacialName: 1,
        rightSpacialVolume: 1,
        paidRightVolume: 1,
        paymentAmount: 1,
        returnAmount: 1,
        status: 1,
        createdOn: 1,
        createdBy: 1,
        updatedOn: 1,
        updatedBy: 1,
      },
    },
    {
      $project: {
        name: {
          $toLower: "$name",
        },
        tempRightStockName: {
          $toLower: "$rightStockName",
        },
        customerId: 1,
        rightStockName: 1,
        stockVolume: 1,
        rightSpacialName: 1,
        rightSpacialVolume: 1,
        paidRightVolume: 1,
        paymentAmount: 1,
        returnAmount: 1,
        status: 1,
        createdOn: 1,
        createdBy: 1,
        updatedOn: 1,
        updatedBy: 1,
      },
    },
    {
      $match: {
        $and: [
          key
            ? {
                $or: [
                  {
                    name: new RegExp(key || ""),
                  },
                  {
                    tempRightStockName: new RegExp(key || ""),
                  },
                  {
                    "customerId.refNo": new RegExp(key || ""),
                  },
                ],
              }
            : {},
          startDate && endDate
            ? {
                createdOn: {
                  $gte: startDate,
                  $lt: endDate,
                },
              }
            : {},
        ],
      },
    },
    {
      $project: {
        customerId: 1,
        rightStockName: 1,
        stockVolume: 1,
        rightSpacialName: 1,
        rightSpacialVolume: 1,
        paidRightVolume: 1,
        paymentAmount: 1,
        returnAmount: 1,
        status: 1,
        createdOn: 1,
        createdBy: 1,
        updatedOn: 1,
        updatedBy: 1,
      },
    },
    {
      $group: {
        _id: null,
        paidAmount: {
          $sum: {
            $cond: [
              {
                $or: [
                  {
                    $eq: [
                      "$status._id",
                      mongoose.Types.ObjectId("62592501d017af7548e56f31"),
                    ],
                  },
                  {
                    $eq: [
                      "$status._id",
                      mongoose.Types.ObjectId("62592501d017af7548e56f33"),
                    ],
                  },
                  {
                    $eq: [
                      "$status._id",
                      mongoose.Types.ObjectId("62592501d017af7548e56f34"),
                    ],
                  },
                ],
              },
              "$paymentAmount",
              0,
            ],
          },
        },
        paymentAmount: {
          $sum: "$paymentAmount",
        },
      },
    },
    {
      $project: {
        _id: 0,
        paidAmount: 1,
        paymentAmount: 1,
        percent: {
          $multiply: [
            {
              $divide: ["$paidAmount", "$paymentAmount"],
            },
            100,
          ],
        },
      },
    },
  ]);

  if (results.length === 0) {
    return;
  }

  return results[0];
}

export async function getOrderCompareSales(
  key: string,
  startDate?: Date,
  endDate?: Date
) {
  const results = await OrderModel.aggregate([
    {
      $lookup: {
        from: "cltMasterCustomer",
        localField: "customerId",
        foreignField: "_id",
        as: "customerId",
      },
    },
    {
      $lookup: {
        from: "cltStatus",
        localField: "status",
        foreignField: "_id",
        as: "status",
      },
    },
    {
      $unwind: {
        path: "$customerId",
      },
    },
    {
      $unwind: {
        path: "$status",
      },
    },
    {
      $project: {
        name: {
          $concat: ["$customerId.name", " ", "$customerId.lastname"],
        },
        customerId: 1,
        rightStockName: 1,
        stockVolume: 1,
        rightSpacialName: 1,
        rightSpacialVolume: 1,
        paidRightVolume: 1,
        paymentAmount: 1,
        returnAmount: 1,
        status: 1,
        createdOn: 1,
        createdBy: 1,
        updatedOn: 1,
        updatedBy: 1,
      },
    },
    {
      $project: {
        name: {
          $toLower: "$name",
        },
        tempRightStockName: {
          $toLower: "$rightStockName",
        },
        customerId: 1,
        rightStockName: 1,
        stockVolume: 1,
        rightSpacialName: 1,
        rightSpacialVolume: 1,
        paidRightVolume: 1,
        paymentAmount: 1,
        returnAmount: 1,
        status: 1,
        createdOn: 1,
        createdBy: 1,
        updatedOn: 1,
        updatedBy: 1,
      },
    },
    {
      $match: {
        $and: [
          key
            ? {
                $or: [
                  {
                    name: new RegExp(key || ""),
                  },
                  {
                    tempRightStockName: new RegExp(key || ""),
                  },
                  {
                    "customerId.refNo": new RegExp(key || ""),
                  },
                ],
              }
            : {},
          startDate && endDate
            ? {
                createdOn: {
                  $gte: startDate,
                  $lt: endDate,
                },
              }
            : {},
        ],
      },
    },
    {
      $project: {
        customerId: 1,
        rightStockName: 1,
        stockVolume: 1,
        rightSpacialName: 1,
        rightSpacialVolume: 1,
        paidRightVolume: 1,
        paymentAmount: 1,
        returnAmount: 1,
        status: 1,
        createdOn: 1,
        createdBy: 1,
        updatedOn: 1,
        updatedBy: 1,
      },
    },
    {
      $group: {
        _id: null,
        order: {
          $sum: {
            $cond: [
              {
                $or: [
                  {
                    $eq: [
                      "$status._id",
                      mongoose.Types.ObjectId("62592501d017af7548e56f32"),
                    ],
                  },
                  {
                    $eq: [
                      "$status._id",
                      mongoose.Types.ObjectId("62592501d017af7548e56f35"),
                    ],
                  },
                ],
              },
              "$paymentAmount",
              0,
            ],
          },
        },
        paymentAmount: {
          $sum: "$paymentAmount",
        },
      },
    },
    {
      $project: {
        _id: 0,
        order: 1,
        paymentAmount: 1,
        percent: {
          $multiply: [
            {
              $divide: ["$order", "$paymentAmount"],
            },
            100,
          ],
        },
      },
    },
  ]);

  if (results.length === 0) {
    return;
  }

  return results[0];
}

interface RemoveEmptyOptions {
  /**
   * Remove empty strings. Default: false
   */
  removeEmptyString?: boolean;

  /**
   * Remove zeros. Default: false
   */
  removeZeros?: boolean;
}

export function decompress(data: string): string {
  const unzipped = zlib.unzipSync(Buffer.from(data, "base64"));
  return unzipped.toString();
}

// switch (mode) {
//   case "order":
//     toFacet = {
//       _metadata: [match, count],
//       data: [
//         sort,
//         match,
//         {
//           $lookup: {
//             from: "cltMasterCustomer",
//             localField: "customerId",
//             foreignField: "_id",
//             as: "customerId",
//           },
//         },
//         {
//           $lookup: {
//             from: "cltStatus",
//             localField: "status",
//             foreignField: "_id",
//             as: "status",
//           },
//         },
//         {
//           $lookup: {
//             from: "cltCustomerStock",
//             localField: "customerStockId",
//             foreignField: "_id",
//             as: "customerStock",
//           },
//         },
//         {
//           $lookup: {
//             from: "cltMasterBrokers",
//             localField: "brokerId",
//             foreignField: "_id",
//             as: "brokerId",
//           },
//         },
//         {
//           $unwind: {
//             path: "$brokerId",
//           },
//         },
//         {
//           $unwind: {
//             path: "$customerId",
//           },
//         },
//         {
//           $unwind: {
//             path: "$status",
//           },
//         },
//         {
//           $unwind: {
//             path: "$customerStock",
//           },
//         },
//         skip,
//         pageSize,
//       ],
//     };
//     break;
//   case "orderSearch":
//     toFacet = {
//       _metadata: [
//         {
//           $lookup: {
//             from: "cltMasterCustomer",
//             localField: "customerId",
//             foreignField: "_id",
//             as: "customerId",
//           },
//         },
//         {
//           $lookup: {
//             from: "cltStatus",
//             localField: "status",
//             foreignField: "_id",
//             as: "status",
//           },
//         },
//         {
//           $unwind: {
//             path: "$customerId",
//           },
//         },
//         {
//           $unwind: {
//             path: "$status",
//           },
//         },
//         {
//           $project: {
//             name: {
//               $concat: ["$customerId.name", " ", "$customerId.lastname"],
//             },
//             customerId: 1,
//             rightStockName: 1,
//             stockVolume: 1,
//             rightSpacialName: 1,
//             rightSpacialVolume: 1,
//             paidRightVolume: 1,
//             paymentAmount: 1,
//             returnAmount: 1,
//             status: 1,
//             createdOn: 1,
//             createdBy: 1,
//             updatedOn: 1,
//             updatedBy: 1,
//           },
//         },
//         {
//           $project: {
//             name: {
//               $toLower: "$name",
//             },
//             tempRightStockName: {
//               $toLower: "$rightStockName",
//             },
//             customerId: 1,
//             rightStockName: 1,
//             stockVolume: 1,
//             rightSpacialName: 1,
//             rightSpacialVolume: 1,
//             paidRightVolume: 1,
//             paymentAmount: 1,
//             returnAmount: 1,
//             status: 1,
//             createdOn: 1,
//             createdBy: 1,
//             updatedOn: 1,
//             updatedBy: 1,
//           },
//         },
//         {
//           $match: {
//             $and: [
//               key
//                 ? {
//                     $or: [
//                       {
//                         name: new RegExp(key || ""),
//                       },
//                       {
//                         tempRightStockName: new RegExp(key || ""),
//                       },
//                       {
//                         "customerId.nationalId": new RegExp(key || ""),
//                       },
//                       {
//                         "customerId.taxId": new RegExp(key || ""),
//                       },
//                     ],
//                   }
//                 : {},
//               startDate && endDate
//                 ? {
//                     createdOn: {
//                       $gte: startDate,
//                       $lt: endDate,
//                     },
//                   }
//                 : {},
//             ],
//           },
//         },
//         {
//           $project: {
//             customerId: 1,
//             rightStockName: 1,
//             stockVolume: 1,
//             rightSpacialName: 1,
//             rightSpacialVolume: 1,
//             paidRightVolume: 1,
//             paymentAmount: 1,
//             returnAmount: 1,
//             status: 1,
//             createdOn: 1,
//             createdBy: 1,
//             updatedOn: 1,
//             updatedBy: 1,
//           },
//         },
//         count,
//       ],
//       data: [
//         sort,
//         {
//           $lookup: {
//             from: "cltMasterCustomer",
//             localField: "customerId",
//             foreignField: "_id",
//             as: "customerId",
//           },
//         },
//         {
//           $lookup: {
//             from: "cltStatus",
//             localField: "status",
//             foreignField: "_id",
//             as: "status",
//           },
//         },
//         {
//           $lookup: {
//             from: "cltCustomerStock",
//             localField: "customerStockId",
//             foreignField: "_id",
//             as: "customerStock",
//           },
//         },
//         {
//           $unwind: {
//             path: "$customerStock",
//           },
//         },
//         {
//           $unwind: {
//             path: "$customerId",
//           },
//         },
//         {
//           $unwind: {
//             path: "$status",
//           },
//         },
//         {
//           $project: {
//             name: {
//               $concat: ["$customerId.name", " ", "$customerId.lastname"],
//             },
//             customerId: 1,
//             rightStockName: 1,
//             stockVolume: 1,
//             rightSpacialName: 1,
//             rightSpacialVolume: 1,
//             paidRightVolume: 1,
//             paymentAmount: 1,
//             returnAmount: 1,
//             status: 1,
//             createdOn: 1,
//             createdBy: 1,
//             updatedOn: 1,
//             updatedBy: 1,
//             attachedFile: 1,
//             attachedOn: 1,
//             excessAmount: 1,
//             customerStock: 1,
//             customerTel: 1,
//           },
//         },
//         {
//           $project: {
//             name: {
//               $toLower: "$name",
//             },
//             tempRightStockName: {
//               $toLower: "$rightStockName",
//             },
//             customerId: 1,
//             rightStockName: 1,
//             stockVolume: 1,
//             rightSpacialName: 1,
//             rightSpacialVolume: 1,
//             paidRightVolume: 1,
//             paymentAmount: 1,
//             returnAmount: 1,
//             status: 1,
//             createdOn: 1,
//             createdBy: 1,
//             updatedOn: 1,
//             updatedBy: 1,
//             attachedFile: 1,
//             attachedOn: 1,
//             excessAmount: 1,
//             customerStock: 1,
//             customerTel: 1,
//           },
//         },
//         {
//           $match: {
//             $and: [
//               key
//                 ? {
//                     $or: [
//                       {
//                         name: new RegExp(key || ""),
//                       },
//                       {
//                         tempRightStockName: new RegExp(key || ""),
//                       },
//                       {
//                         "customerId.nationalId": new RegExp(key || ""),
//                       },
//                       {
//                         "customerId.taxId": new RegExp(key || ""),
//                       },
//                     ],
//                   }
//                 : {},
//               startDate && endDate
//                 ? {
//                     createdOn: {
//                       $gte: startDate,
//                       $lt: endDate,
//                     },
//                   }
//                 : {},
//             ],
//           },
//         },
//         {
//           $project: {
//             customerId: 1,
//             rightStockName: 1,
//             stockVolume: 1,
//             rightSpacialName: 1,
//             rightSpacialVolume: 1,
//             paidRightVolume: 1,
//             paymentAmount: 1,
//             returnAmount: 1,
//             status: 1,
//             createdOn: 1,
//             createdBy: 1,
//             updatedOn: 1,
//             updatedBy: 1,
//             attachedFile: 1,
//             attachedOn: 1,
//             excessAmount: 1,
//             customerStock: 1,
//             customerTel: 1,
//           },
//         },

//         skip,
//         pageSize,
//       ],
//     };
//     break;
//   case "customer":
//     toFacet = {
//       _metadata: [
//         {
//           $match: {
//             $and: [
//               key
//                 ? {
//                     $or: [
//                       {
//                         nationalId: new RegExp(key || ""),
//                       },
//                       {
//                         passportNo: new RegExp(key || ""),
//                       },
//                       {
//                         passportNo: new RegExp(key || ""),
//                       },
//                     ],
//                   }
//                 : {},
//             ],
//           },
//         },
//         ,
//         count,
//       ],
//       data: [
//         sort,
//         {
//           $match: {
//             $and: [
//               key
//                 ? {
//                     $or: [
//                       {
//                         nationalId: new RegExp(key || ""),
//                       },
//                       {
//                         passportNo: new RegExp(key || ""),
//                       },
//                       {
//                         taxId: new RegExp(key || ""),
//                       },
//                     ],
//                   }
//                 : {},
//             ],
//           },
//         },
//       ],
//     };
//     break;
//   case "customerStockSearch":
//     toFacet = {
//       _metadata: [
//         match,
//         {
//           $lookup: {
//             from: "cltMasterCustomer",
//             localField: "customerId",
//             foreignField: "_id",
//             as: "customers",
//           },
//         },
//         {
//           $lookup: {
//             from: "cltOrders",
//             localField: "_id",
//             foreignField: "customerStockId",
//             as: "orders",
//           },
//         },
//         {
//           $unwind: {
//             path: "$orders",
//             preserveNullAndEmptyArrays: true,
//           },
//         },
//         {
//           $lookup: {
//             from: "cltMasterBrokers",
//             localField: "orders.brokerId",
//             foreignField: "_id",
//             as: "orders.brokerId",
//           },
//         },
//         {
//           $unwind: {
//             path: "$orders.brokerId",
//             preserveNullAndEmptyArrays: true,
//           },
//         },
//         {
//           $lookup: {
//             from: "cltMasterBanks",
//             localField: "orders.bankRefund",
//             foreignField: "_id",
//             as: "orders.bankRefund",
//           },
//         },
//         {
//           $unwind: {
//             path: "$orders.bankRefund",
//             preserveNullAndEmptyArrays: true,
//           },
//         },
//         {
//           $lookup: {
//             from: "cltStatus",
//             localField: "orders.status",
//             foreignField: "_id",
//             as: "status",
//           },
//         },
//         {
//           $unwind: {
//             path: "$customers",
//             preserveNullAndEmptyArrays: true,
//           },
//         },
//         {
//           $addFields: {
//             keyNationalId: "$customers.nationalId",
//             keyTaxId: "$customers.taxId",
//           },
//         },
//         {
//           $match: {
//             $and: [
//               key
//                 ? {
//                     $or: [
//                       {
//                         keyNationalId: new RegExp(key || ""),
//                       },
//                       {
//                         keyTaxId: new RegExp(key || ""),
//                       },
//                     ],
//                   }
//                 : {},
//             ],
//           },
//         },
//         count,
//       ],
//       data: [
//         match,
//         sort,
//         {
//           $lookup: {
//             from: "cltMasterCustomer",
//             localField: "customerId",
//             foreignField: "_id",
//             as: "customers",
//           },
//         },
//         {
//           $lookup: {
//             from: "cltOrders",
//             localField: "_id",
//             foreignField: "customerStockId",
//             as: "orders",
//           },
//         },
//         {
//           $unwind: {
//             path: "$orders",
//             preserveNullAndEmptyArrays: true,
//           },
//         },
//         {
//           $lookup: {
//             from: "cltMasterBrokers",
//             localField: "orders.brokerId",
//             foreignField: "_id",
//             as: "orders.brokerId",
//           },
//         },
//         {
//           $unwind: {
//             path: "$orders.brokerId",
//             preserveNullAndEmptyArrays: true,
//           },
//         },
//         {
//           $lookup: {
//             from: "cltMasterBanks",
//             localField: "orders.bankRefund",
//             foreignField: "_id",
//             as: "orders.bankRefund",
//           },
//         },
//         {
//           $unwind: {
//             path: "$orders.bankRefund",
//             preserveNullAndEmptyArrays: true,
//           },
//         },
//         {
//           $lookup: {
//             from: "cltStatus",
//             localField: "orders.status",
//             foreignField: "_id",
//             as: "status",
//           },
//         },
//         {
//           $unwind: {
//             path: "$customers",
//             preserveNullAndEmptyArrays: true,
//           },
//         },
//         {
//           $addFields: {
//             keyNationalId: "$customers.nationalId",
//             keyTaxId: "$customers.taxId",
//           },
//         },
//         {
//           $match: {
//             $and: [
//               key
//                 ? {
//                     $or: [
//                       {
//                         keyNationalId: new RegExp(key || ""),
//                       },
//                       {
//                         keyTaxId: new RegExp(key || ""),
//                       },
//                     ],
//                   }
//                 : {},
//             ],
//           },
//         },
//         skip,
//         pageSize,
//       ],
//     };
//     break;
// }

// switch (mode) {
//   case "order":
//     toFacet = {
//       _metadata: [match, count],
//       data: [
//         sort,
//         match,
//         {
//           $lookup: {
//             from: "cltMasterCustomer",
//             localField: "customerId",
//             foreignField: "_id",
//             as: "customerId",
//           },
//         },
//         {
//           $lookup: {
//             from: "cltStatus",
//             localField: "status",
//             foreignField: "_id",
//             as: "status",
//           },
//         },
//         {
//           $lookup: {
//             from: "cltCustomerStock",
//             localField: "customerStockId",
//             foreignField: "_id",
//             as: "customerStock",
//           },
//         },
//         {
//           $lookup: {
//             from: "cltMasterBrokers",
//             localField: "brokerId",
//             foreignField: "_id",
//             as: "brokerId",
//           },
//         },
//         {
//           $unwind: {
//             path: "$brokerId",
//           },
//         },
//         {
//           $unwind: {
//             path: "$customerId",
//           },
//         },
//         {
//           $unwind: {
//             path: "$status",
//           },
//         },
//         {
//           $unwind: {
//             path: "$customerStock",
//           },
//         },
//         skip,
//         pageSize,
//       ],
//     };
//     break;
//   case "orderSearch":
//     toFacet = {
//       _metadata: [
//         {
//           $lookup: {
//             from: "cltMasterCustomer",
//             localField: "customerId",
//             foreignField: "_id",
//             as: "customerId",
//           },
//         },
//         {
//           $lookup: {
//             from: "cltStatus",
//             localField: "status",
//             foreignField: "_id",
//             as: "status",
//           },
//         },
//         {
//           $unwind: {
//             path: "$customerId",
//           },
//         },
//         {
//           $unwind: {
//             path: "$status",
//           },
//         },
//         {
//           $project: {
//             name: {
//               $concat: ["$customerId.name", " ", "$customerId.lastname"],
//             },
//             customerId: 1,
//             rightStockName: 1,
//             stockVolume: 1,
//             rightSpacialName: 1,
//             rightSpacialVolume: 1,
//             paidRightVolume: 1,
//             paymentAmount: 1,
//             returnAmount: 1,
//             status: 1,
//             createdOn: 1,
//             createdBy: 1,
//             updatedOn: 1,
//             updatedBy: 1,
//           },
//         },
//         {
//           $project: {
//             name: {
//               $toLower: "$name",
//             },
//             tempRightStockName: {
//               $toLower: "$rightStockName",
//             },
//             customerId: 1,
//             rightStockName: 1,
//             stockVolume: 1,
//             rightSpacialName: 1,
//             rightSpacialVolume: 1,
//             paidRightVolume: 1,
//             paymentAmount: 1,
//             returnAmount: 1,
//             status: 1,
//             createdOn: 1,
//             createdBy: 1,
//             updatedOn: 1,
//             updatedBy: 1,
//           },
//         },
//         {
//           $match: {
//             $and: [
//               key
//                 ? {
//                     $or: [
//                       {
//                         name: new RegExp(key || ""),
//                       },
//                       {
//                         tempRightStockName: new RegExp(key || ""),
//                       },
//                       {
//                         "customerId.nationalId": new RegExp(key || ""),
//                       },
//                       {
//                         "customerId.taxId": new RegExp(key || ""),
//                       },
//                     ],
//                   }
//                 : {},
//               startDate && endDate
//                 ? {
//                     createdOn: {
//                       $gte: startDate,
//                       $lt: endDate,
//                     },
//                   }
//                 : {},
//             ],
//           },
//         },
//         {
//           $project: {
//             customerId: 1,
//             rightStockName: 1,
//             stockVolume: 1,
//             rightSpacialName: 1,
//             rightSpacialVolume: 1,
//             paidRightVolume: 1,
//             paymentAmount: 1,
//             returnAmount: 1,
//             status: 1,
//             createdOn: 1,
//             createdBy: 1,
//             updatedOn: 1,
//             updatedBy: 1,
//           },
//         },
//         count,
//       ],
//       data: [
//         sort,
//         {
//           $lookup: {
//             from: "cltMasterCustomer",
//             localField: "customerId",
//             foreignField: "_id",
//             as: "customerId",
//           },
//         },
//         {
//           $lookup: {
//             from: "cltStatus",
//             localField: "status",
//             foreignField: "_id",
//             as: "status",
//           },
//         },
//         {
//           $lookup: {
//             from: "cltCustomerStock",
//             localField: "customerStockId",
//             foreignField: "_id",
//             as: "customerStock",
//           },
//         },
//         {
//           $unwind: {
//             path: "$customerStock",
//           },
//         },
//         {
//           $unwind: {
//             path: "$customerId",
//           },
//         },
//         {
//           $unwind: {
//             path: "$status",
//           },
//         },
//         {
//           $project: {
//             name: {
//               $concat: ["$customerId.name", " ", "$customerId.lastname"],
//             },
//             customerId: 1,
//             rightStockName: 1,
//             stockVolume: 1,
//             rightSpacialName: 1,
//             rightSpacialVolume: 1,
//             paidRightVolume: 1,
//             paymentAmount: 1,
//             returnAmount: 1,
//             status: 1,
//             createdOn: 1,
//             createdBy: 1,
//             updatedOn: 1,
//             updatedBy: 1,
//             attachedFile: 1,
//             attachedOn: 1,
//             excessAmount: 1,
//             customerStock: 1,
//             customerTel: 1,
//           },
//         },
//         {
//           $project: {
//             name: {
//               $toLower: "$name",
//             },
//             tempRightStockName: {
//               $toLower: "$rightStockName",
//             },
//             customerId: 1,
//             rightStockName: 1,
//             stockVolume: 1,
//             rightSpacialName: 1,
//             rightSpacialVolume: 1,
//             paidRightVolume: 1,
//             paymentAmount: 1,
//             returnAmount: 1,
//             status: 1,
//             createdOn: 1,
//             createdBy: 1,
//             updatedOn: 1,
//             updatedBy: 1,
//             attachedFile: 1,
//             attachedOn: 1,
//             excessAmount: 1,
//             customerStock: 1,
//             customerTel: 1,
//           },
//         },
//         {
//           $match: {
//             $and: [
//               key
//                 ? {
//                     $or: [
//                       {
//                         name: new RegExp(key || ""),
//                       },
//                       {
//                         tempRightStockName: new RegExp(key || ""),
//                       },
//                       {
//                         "customerId.nationalId": new RegExp(key || ""),
//                       },
//                       {
//                         "customerId.taxId": new RegExp(key || ""),
//                       },
//                     ],
//                   }
//                 : {},
//               startDate && endDate
//                 ? {
//                     createdOn: {
//                       $gte: startDate,
//                       $lt: endDate,
//                     },
//                   }
//                 : {},
//             ],
//           },
//         },
//         {
//           $project: {
//             customerId: 1,
//             rightStockName: 1,
//             stockVolume: 1,
//             rightSpacialName: 1,
//             rightSpacialVolume: 1,
//             paidRightVolume: 1,
//             paymentAmount: 1,
//             returnAmount: 1,
//             status: 1,
//             createdOn: 1,
//             createdBy: 1,
//             updatedOn: 1,
//             updatedBy: 1,
//             attachedFile: 1,
//             attachedOn: 1,
//             excessAmount: 1,
//             customerStock: 1,
//             customerTel: 1,
//           },
//         },

//         skip,
//         pageSize,
//       ],
//     };
//     break;
//   case "customer":
//     toFacet = {
//       _metadata: [
//         {
//           $match: {
//             $and: [
//               key
//                 ? {
//                     $or: [
//                       {
//                         nationalId: new RegExp(key || ""),
//                       },
//                       {
//                         passportNo: new RegExp(key || ""),
//                       },
//                       {
//                         passportNo: new RegExp(key || ""),
//                       },
//                     ],
//                   }
//                 : {},
//             ],
//           },
//         },
//         ,
//         count,
//       ],
//       data: [
//         sort,
//         {
//           $match: {
//             $and: [
//               key
//                 ? {
//                     $or: [
//                       {
//                         nationalId: new RegExp(key || ""),
//                       },
//                       {
//                         passportNo: new RegExp(key || ""),
//                       },
//                       {
//                         taxId: new RegExp(key || ""),
//                       },
//                     ],
//                   }
//                 : {},
//             ],
//           },
//         },
//       ],
//     };
//     break;
//   case "customerStockSearch":
//     toFacet = {
//       _metadata: [
//         match,
//         {
//           $lookup: {
//             from: "cltMasterCustomer",
//             localField: "customerId",
//             foreignField: "_id",
//             as: "customers",
//           },
//         },
//         {
//           $lookup: {
//             from: "cltOrders",
//             localField: "_id",
//             foreignField: "customerStockId",
//             as: "orders",
//           },
//         },
//         {
//           $unwind: {
//             path: "$orders",
//             preserveNullAndEmptyArrays: true,
//           },
//         },
//         {
//           $lookup: {
//             from: "cltMasterBrokers",
//             localField: "orders.brokerId",
//             foreignField: "_id",
//             as: "orders.brokerId",
//           },
//         },
//         {
//           $unwind: {
//             path: "$orders.brokerId",
//             preserveNullAndEmptyArrays: true,
//           },
//         },
//         {
//           $lookup: {
//             from: "cltMasterBanks",
//             localField: "orders.bankRefund",
//             foreignField: "_id",
//             as: "orders.bankRefund",
//           },
//         },
//         {
//           $unwind: {
//             path: "$orders.bankRefund",
//             preserveNullAndEmptyArrays: true,
//           },
//         },
//         {
//           $lookup: {
//             from: "cltStatus",
//             localField: "orders.status",
//             foreignField: "_id",
//             as: "status",
//           },
//         },
//         {
//           $unwind: {
//             path: "$customers",
//             preserveNullAndEmptyArrays: true,
//           },
//         },
//         {
//           $addFields: {
//             keyNationalId: "$customers.nationalId",
//             keyTaxId: "$customers.taxId",
//           },
//         },
//         {
//           $match: {
//             $and: [
//               key
//                 ? {
//                     $or: [
//                       {
//                         keyNationalId: new RegExp(key || ""),
//                       },
//                       {
//                         keyTaxId: new RegExp(key || ""),
//                       },
//                     ],
//                   }
//                 : {},
//             ],
//           },
//         },
//         count,
//       ],
//       data: [
//         match,
//         sort,
//         {
//           $lookup: {
//             from: "cltMasterCustomer",
//             localField: "customerId",
//             foreignField: "_id",
//             as: "customers",
//           },
//         },
//         {
//           $lookup: {
//             from: "cltOrders",
//             localField: "_id",
//             foreignField: "customerStockId",
//             as: "orders",
//           },
//         },
//         {
//           $unwind: {
//             path: "$orders",
//             preserveNullAndEmptyArrays: true,
//           },
//         },
//         {
//           $lookup: {
//             from: "cltMasterBrokers",
//             localField: "orders.brokerId",
//             foreignField: "_id",
//             as: "orders.brokerId",
//           },
//         },
//         {
//           $unwind: {
//             path: "$orders.brokerId",
//             preserveNullAndEmptyArrays: true,
//           },
//         },
//         {
//           $lookup: {
//             from: "cltMasterBanks",
//             localField: "orders.bankRefund",
//             foreignField: "_id",
//             as: "orders.bankRefund",
//           },
//         },
//         {
//           $unwind: {
//             path: "$orders.bankRefund",
//             preserveNullAndEmptyArrays: true,
//           },
//         },
//         {
//           $lookup: {
//             from: "cltStatus",
//             localField: "orders.status",
//             foreignField: "_id",
//             as: "status",
//           },
//         },
//         {
//           $unwind: {
//             path: "$customers",
//             preserveNullAndEmptyArrays: true,
//           },
//         },
//         {
//           $addFields: {
//             keyNationalId: "$customers.nationalId",
//             keyTaxId: "$customers.taxId",
//           },
//         },
//         {
//           $match: {
//             $and: [
//               key
//                 ? {
//                     $or: [
//                       {
//                         keyNationalId: new RegExp(key || ""),
//                       },
//                       {
//                         keyTaxId: new RegExp(key || ""),
//                       },
//                     ],
//                   }
//                 : {},
//             ],
//           },
//         },
//         skip,
//         pageSize,
//       ],
//     };
//     break;
// }
