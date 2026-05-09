import { z } from 'zod';

export const columnSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Column name is required.')
    .min(3, 'Column name must be at least 3 characters.')
    .max(50, 'Column name must be at most 50 characters.'),
  taskName: z.string().optional(),
  color: z.string(),
});

export type ColumnFormValues = z.infer<typeof columnSchema>;
