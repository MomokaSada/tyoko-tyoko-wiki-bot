import { z } from 'zod';
import { InteractionType } from 'discord-interactions';
import { keysToCamelCase } from '@/lib/utils';

/**
 * Discord から受信する Interaction ペイロードのスキーマ。
 * ルートハンドラ内で `parse()` により runtime 検証 + 型推論を同時に行う。
 */
const RawInteractionSchema = z.object({
  type: z.nativeEnum(InteractionType),
  id: z.string(),
  application_id: z.string(),
  channel_id: z.string(),
  guild_id: z.string().optional(),
  token: z.string(),
  member: z.object({
    user: z.object({
      id: z.string(),
      username: z.string(),
      global_name: z.string().optional(),
    }),
  }).optional(),
  data: z.object({
    name: z.string().optional(),
    custom_id: z.string().optional(),
    options: z.array(z.object({
      name: z.string(),
      type: z.number(),
      value: z.union([z.string(), z.number(), z.boolean()]),
    })).optional(),
  }).optional(),
  message: z.object({
    id: z.string(),
    content: z.string(),
  }).optional(),
});

export const InteractionSchema = RawInteractionSchema.transform(
  (raw) => keysToCamelCase(raw),
);

export type ParsedInteraction = z.infer<typeof InteractionSchema>;