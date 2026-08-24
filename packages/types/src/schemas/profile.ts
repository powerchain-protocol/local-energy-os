import { z } from "zod";
export const profileUpdateSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  jobTitle: z.string().trim().max(100).optional(),
  company: z.string().trim().max(120).optional(),
  timezone: z.string().trim().min(2).max(80),
  locale: z.string().trim().regex(/^[a-z]{2}(?:-[A-Z]{2})?$/),
  emailNotifications: z.boolean().default(true),
});
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
