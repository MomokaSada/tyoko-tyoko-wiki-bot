import { NextResponse } from 'next/server';
import { InteractionResponseType } from 'discord-interactions';
import type { ParsedInteraction } from '@/discord/schemas/interaction';
import { createThread, sendMessage, sendFollowupMessage } from '@/discord/lib/rest';
import { DEFAULT_EXPIRES_IN_MINUTES, DEFAULT_MAX_EDITS } from "@/discord/lib/constants";

export function handleSetCommand(
    interaction: ParsedInteraction
) {
    const appId = interaction.applicationId;
    const channelId = interaction.channelId;
    const token = interaction.token;

    const options = interaction.data?.options ?? [];
    const expiresIn = options.find((o) => o.name === 'expires_in')?.value ?? DEFAULT_EXPIRES_IN_MINUTES;
    const maxEdits = options.find((o) => o.name === 'max_edits')?.value ?? DEFAULT_MAX_EDITS;

    const response = NextResponse.json({
        type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
    });

    doAsync(async () => {
        try {
            const threadId = await createThread(channelId,'項目編集リンク投稿');
            await sendMessage(threadId, 'ここに編集リンクが投稿されます');
            await sendFollowupMessage(
                appId,
                token,
                {
                    content:
                        `>>> 項目編集リンク\n` +
                        `有効期限: ${expiresIn}分 | 最大編集回数: ${maxEdits}回\n` +
                        `編集用リンクを発行するには下のボタンを押してください。`,
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2,
                                    style: 1,
                                    label: '編集リンクを発行',
                                    custom_id: `create_edit_link:${threadId}:${expiresIn}:${maxEdits}`
                                },
                            ],
                        },
                    ],
                }
            );
        } catch (err) {
            console.error('Set command followup failed:', err);
            await sendFollowupMessage(appId, token, 'スレッドの作成に失敗しました', true).catch(() => {});
        }
    });

    return response;
}

function doAsync(fn: () => Promise<void>): void {
    fn().catch(console.error);
}