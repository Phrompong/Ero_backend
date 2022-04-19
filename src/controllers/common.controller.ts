import { mongoose } from "@typegoose/typegoose";
import ld, { filter, isEmpty as _isEmpty } from "lodash";
import { OrderModel } from "../models/order.model";
import { SchemaType } from "mongoose";
import { CustomerStockModel } from "../models/customer.stock.model";

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
  filter: unknown,
  pageInput: number,
  limitInput: number,
  sort: unknown,
  Model: any,
  mode?: string,
  key?: string,
  startDate?: Date,
  endDate?: Date
): Promise<any> {
  let match = { $match: {} };

  if (filter) {
    match = { $match: mutateQueryFilters(Model, filter) };
  }

  const skip = { $skip: pageInput * limitInput - limitInput };
  const pageSize = { $limit: limitInput || 10 };
  const count = { $count: "total" };

  let toFacet;

  if (mode === "search") {
    toFacet = {
      _metadata: [
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
                    ],
                  }
                : {},
              {
                createdOn: {
                  $gte: startDate,
                  $lt: endDate,
                },
              },
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
        count,
      ],
      data: [
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
            attachedFile: 1,
            attachedOn: 1,
            excessAmount: 1,
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
                    ],
                  }
                : {},
              {
                createdOn: {
                  $gte: startDate,
                  $lt: endDate,
                },
              },
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
          },
        },
        skip,
        pageSize,
      ],
    };
  } else {
    toFacet = {
      _metadata: [match, count],
      data: [
        sort,
        match,
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
        skip,
        pageSize,
      ],
    };
  }

  const toSearchBody = { $facet: toFacet };

  const find = await Model.aggregate([toSearchBody]);

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

  const total = find[0]._metadata[0].total;
  const totalPages = Math.ceil(total / limitInput);

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
  startDate: Date,
  endDate: Date
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
                ],
              }
            : {},
          {
            createdOn: {
              $gte: startDate,
              $lt: endDate,
            },
          },
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
  startDate: Date,
  endDate: Date
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
                ],
              }
            : {},
          {
            createdOn: {
              $gte: startDate,
              $lt: endDate,
            },
          },
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
