import { z } from 'zod';

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'Task name is required.')
    .min(3, 'Task name must be at least 3 characters.')
    .max(50, 'Task name must be at most 50 characters.'),
  description: z.string().default(''),
  status: z.string().min(1, 'Status is required.'),
  subtasks: z
    .array(z.object({ title: z.string(), isCompleted: z.boolean() }))
    .refine((subtasks) => subtasks.length > 0 && subtasks[0].title.trim().length > 0, {
      message: 'Subtask name is required.',
      path: ['0.title'],
    }),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
