import { z } from 'zod';

/**
 * アプリ側 API（POST /api/bot/edit-sessions）の成功レスポンススキーマ。
 */
export const EditSessionResponseSchema = z.object({
  uuid: z.string().uuid(),
  url: z.string(),
  endAt: z.string().datetime(),
  maxEdits: z.number(),
  authorId: z.number(),
});

export type EditSessionResponse = z.infer<typeof EditSessionResponseSchema>;
