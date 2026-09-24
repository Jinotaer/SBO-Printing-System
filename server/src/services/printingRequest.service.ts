import { ApiError } from "../utils/ApiError.js";
import type { CreatePrintingRequestDto, UpdatePrintingRequestDto, PaginationQuery } from "../validators/printingRequest.validator.js";
import type { PrintingRequestRepository } from "../repositories/printingRequest.repository.js";

/**
 * Service Layer Pattern — business logic separated from data access.
 */
export class PrintingRequestService {
  constructor(private readonly repo: PrintingRequestRepository) {}

  async list(query: PaginationQuery) {
    const { data, total } = await this.repo.findAll(query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    const doc = await this.repo.findById(id);
    if (!doc) throw ApiError.notFound("Printing request not found");
    return doc;
  }

  async create(dto: CreatePrintingRequestDto) {
    // Business rule example: due date cannot be in the past
    if (dto.dueDate && dto.dueDate < new Date()) {
      throw ApiError.badRequest("Due date cannot be in the past");
    }
    return this.repo.create(dto);
  }

  async update(id: string, dto: UpdatePrintingRequestDto) {
    const existing = await this.repo.findById(id);
    if (!existing) throw ApiError.notFound("Printing request not found");

    // Business rule: cannot edit completed requests
    if (existing.status === "completed") {
      throw ApiError.badRequest("Cannot update a completed request");
    }

    const updated = await this.repo.update(id, dto);
    if (!updated) throw ApiError.notFound("Printing request not found");
    return updated;
  }

  async delete(id: string) {
    const deleted = await this.repo.delete(id);
    if (!deleted) throw ApiError.notFound("Printing request not found");
    return deleted;
  }
}
