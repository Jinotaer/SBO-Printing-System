import mongoose from "mongoose";
import { PrintingRequest, type PrintingRequestDoc } from "../models/PrintingRequest.model.js";
import type { CreatePrintingRequestDto, UpdatePrintingRequestDto, PaginationQuery } from "../validators/printingRequest.validator.js";
import { ApiError } from "../utils/ApiError.js";

function ensureDbConnected(): void {
  if (mongoose.connection.readyState !== 1) {
    throw new ApiError(503, "Database unavailable — please try again shortly");
  }
}

/**
 * Repository Pattern — abstracts data access.
 * Service layer never touches Mongoose directly.
 */
export interface PrintingRequestRepository {
  findAll(query: PaginationQuery): Promise<{ data: PrintingRequestDoc[]; total: number }>;
  findById(id: string): Promise<PrintingRequestDoc | null>;
  create(data: CreatePrintingRequestDto): Promise<PrintingRequestDoc>;
  update(id: string, data: UpdatePrintingRequestDto): Promise<PrintingRequestDoc | null>;
  delete(id: string): Promise<PrintingRequestDoc | null>;
}

export class MongoosePrintingRequestRepository implements PrintingRequestRepository {
  async findAll(query: PaginationQuery): Promise<{ data: PrintingRequestDoc[]; total: number }> {
    ensureDbConnected();
    const filter: Record<string, unknown> = {};

    if (query.status) filter["status"] = query.status;
    if (query.search) {
      // Single query with regex — avoid N+1, use indexed field
      filter["title"] = { $regex: query.search, $options: "i" };
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    // Sort whitelist to prevent injection
    const allowedSort = new Set(["createdAt", "-createdAt", "quantity", "-quantity", "dueDate", "-dueDate"]);
    const sortField = query.sort && allowedSort.has(query.sort) ? query.sort : "-createdAt";

    // GOOD: select only needed fields, paginated, indexed query
    const [data, total] = await Promise.all([
      PrintingRequest.find(filter)
        .select("title status quantity paperSize colorMode requestedBy dueDate createdAt")
        .sort(sortField)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec() as unknown as Promise<PrintingRequestDoc[]>,
      PrintingRequest.countDocuments(filter).exec(),
    ]);

    return { data, total };
  }

  async findById(id: string): Promise<PrintingRequestDoc | null> {
    ensureDbConnected();
    return PrintingRequest.findById(id).exec();
  }

  async create(data: CreatePrintingRequestDto): Promise<PrintingRequestDoc> {
    ensureDbConnected();
    // exactOptionalPropertyTypes workaround: Mongoose types don't allow undefined for optional fields
    const cleaned = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
    return (PrintingRequest.create as unknown as (doc: unknown) => Promise<PrintingRequestDoc>)(cleaned);
  }

  async update(id: string, data: UpdatePrintingRequestDto): Promise<PrintingRequestDoc | null> {
    ensureDbConnected();
    return PrintingRequest.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  }

  async delete(id: string): Promise<PrintingRequestDoc | null> {
    ensureDbConnected();
    return PrintingRequest.findByIdAndDelete(id).exec();
  }
}
