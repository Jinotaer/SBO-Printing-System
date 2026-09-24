import { z } from "zod";

// Query pagination / filtering — reusable across list endpoints (REST pattern)
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected", "completed"]).optional(),
  search: z.string().optional(),
});

export const createPrintingRequestSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(1).max(2000),
  quantity: z.number().int().min(1).max(10000),
  paperSize: z.enum(["A4", "A3", "Letter", "Legal", "Custom"]),
  colorMode: z.enum(["bw", "color", "mixed"]),
  status: z.enum(["pending", "approved", "rejected", "completed"]).optional().default("pending"),
  requestedBy: z.string().email().or(z.string().min(1)), // user id or email
  dueDate: z.coerce.date().optional(),
});

export const updatePrintingRequestSchema = createPrintingRequestSchema.partial();

export type CreatePrintingRequestDto = z.infer<typeof createPrintingRequestSchema>;
export type UpdatePrintingRequestDto = z.infer<typeof updatePrintingRequestSchema>;
export type PaginationQuery = z.infer<typeof paginationSchema>;
