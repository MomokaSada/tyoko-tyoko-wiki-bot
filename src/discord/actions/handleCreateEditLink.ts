import { NextResponse } from "next/server";
import { InteractionResponseType, InteractionResponseFlags } from "discord-interactions";
import type { ParsedInteraction } from "@/discord/schemas/interaction";
import { sendMessage } from "@/discord/lib/rest";
import { createEditSession } from "@/discord/lib/appApi";
import { DEFAULT_EXPIRES_IN_MINUTES, DEFAULT_MAX_EDITS } from "@/discord/lib/constants";

export async function handleCreateEditLink(
    interaction : ParsedInteraction
) {
    const customId = interaction.data?.customId;
    if (!customId) {
        return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: 'エラー: custom_id が見つかりません', flags: InteractionResponseFlags.EPHEMERAL },
        });
    }

    const parts = customId.split(':');
    const threadId = parts[1];
    if (!threadId) {
        return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: 'エラー: thread_id が見つかりません', flags: InteractionResponseFlags.EPHEMERAL },
        });
    }

    const expiresInMinutes = parts[2] ? Number(parts[2]) : DEFAULT_EXPIRES_IN_MINUTES;
    const maxEdits = parts[3] ? Number(parts[3]) : DEFAULT_MAX_EDITS;

    try{
        const data = await createEditSession(expiresInMinutes, maxEdits);
        if (data === null) {
            return NextResponse.json({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: { content: 'アクティブな編集セッションが十分に残っています', flags: InteractionResponseFlags.EPHEMERAL },
            });
        }
        await sendMessage(
            threadId,
            `編集リンク: ${process.env.APP_API_URL}${data.url}`
        );
        return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: '編集リンクをスレッドに投稿しました', flags: InteractionResponseFlags.EPHEMERAL },
        });
    } catch (err) {
        console.error('Button followup failed:', err);
        return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: 'エラーが発生しました', flags: InteractionResponseFlags.EPHEMERAL },
        });
    }
}