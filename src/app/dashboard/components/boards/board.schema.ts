import { z } from 'zod';

import { MAX_COLUMNS, DEFAULT_COLUMN_COLORS } from '../../context/kanban.utils';

export const boardSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Board name is required.')
    .min(3, 'Board name must be at least 3 characters.')
    .max(50, 'Board name must be at most 50 characters.'),
  columns: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().trim(),
        color: z.string().default(DEFAULT_COLUMN_COLORS[0]),
      }),
    )
    .max(MAX_COLUMNS)
    .refine((columns) => columns.length > 0 && columns[0].name.length > 0, {
      message: 'Column name is required.',
      path: ['0.name'],
    }),
});

export type BoardFormValues = z.infer<typeof boardSchema>;

export const defaultValues: BoardFormValues = {
  name: '',
  columns: [{ name: '', color: DEFAULT_COLUMN_COLORS[0] }],
};
