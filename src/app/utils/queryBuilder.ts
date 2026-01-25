import { Query } from "mongoose";
import { excludeFields } from "../constants/constants";

export class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public readonly query: Record<string, string>;
  constructor(modelQuery: Query<T[], T>, query: Record<string, string>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  filter(): this {
    const filter = { ...this.query };
    for (const field of excludeFields) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete filter[field];
    }
    this.modelQuery = this.modelQuery.find(filter);
    return this;
  }
  search(searchableFields: string[]): this {
    const searchTerm = this.query.searchTerm || "";
    const searchQuery = {
      $or: searchableFields.map((field: string) => ({ [field]: { $regex: searchTerm, $options: "i" } })),
    };
    this.modelQuery = this.modelQuery.find(searchQuery);
    return this;
  }
  sort(): this {
    const sort = this.query?.sort || "-createdAt";
    this.modelQuery = this.modelQuery.sort(sort);
    return this;
  }

  fields(): this {
    const fields = this.query.fields?.split(",").join(" ") || "";
    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }

  paginate(): this {
    const page = parseInt(this.query.page, 10) || 1;
    const limit = parseInt(this.query.limit, 10) || 10;

    //   // Calculate the skip value for pagination
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);
    return this;
  }

  async getMeta() {
    const totalDocuments = await this.modelQuery.model.countDocuments();
    const page = parseInt(this.query.page, 10) || 1;
    const limit = parseInt(this.query.limit, 10) || 10;
    const totalPages = Math.ceil(totalDocuments / limit);

    return {
      page,
      limit,
      total: totalDocuments,
      totalPages,
    };
  }

  build(): Query<T[], T> {
    return this.modelQuery;
  }
}
