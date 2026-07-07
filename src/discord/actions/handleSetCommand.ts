import { NextResponse } from 'next/server';
import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions';
import type { ParsedInteraction } from '@/discord/schemas/interaction';
import { createThread, sendMessage } from '@/discord/lib/rest';
import { DEFAULT_EXPIRES_IN_MINUTES, DEFAULT_MAX_EDITS } from "@/discord/lib/constants";

export async function handleSetCommand(
    interaction: ParsedInteraction
) {
    const channelId = interaction.channelId;

    const options = interaction.data?.options ?? [];
    const expiresIn = options.find((o) => o.name === 'expires_in')?.value ?? DEFAULT_EXPIRES_IN_MINUTES;
    const maxEdits = options.find((o) => o.name === 'max_edits')?.value ?? DEFAULT_MAX_EDITS;

    try {
        const threadId = await createThread(channelId, '項目編集リンク投稿');
        await sendMessage(threadId, 'ここに編集リンクが投稿されます');

        return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
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
            },
        });
    } catch (err) {
        console.error('Set command failed:', err);
        return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: 'スレッドの作成に失敗しました',
                flags: InteractionResponseFlags.EPHEMERAL,
            },
        });
    }
}