import z from 'zod';

export const boardSchema = z.object({
  name: z
    .string()
    .min(1, 'Board name is required.')
    .min(3, 'Board name must be at least 3 characters.')
    .max(50, 'Board name must be at most 50 characters.'),
  columns: z
    .array(z.object({ id: z.string().optional(), name: z.string(), color: z.string() }))
    .refine((columns) => columns.length > 0 && columns[0].name.trim().length > 0, {
      message: 'Column name is required.',
      path: ['0.name'],
    }),
});

export type BoardFormValues = z.infer<typeof boardSchema>;
