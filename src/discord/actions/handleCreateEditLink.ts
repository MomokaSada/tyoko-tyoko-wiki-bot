import { NextResponse } from "next/server";
import { InteractionResponseType } from "discord-interactions";
import type { ParsedInteraction } from "@/discord/schemas/interaction";
import { EditSessionResponseSchema } from "@/discord/schemas/editSession";
import { sendMessage, sendFollowupMessage } from "@/discord/lib/rest";
import { createEditSession } from "@/discord/lib/appApi";
import { DEFAULT_EXPIRES_IN_MINUTES, DEFAULT_MAX_EDITS } from "@/discord/lib/constants";

export function handleCreateEditLink(
    interaction : ParsedInteraction
) {
    const appId = interaction.applicationId;
    const token = interaction.token;

    const customId = interaction.data?.customId;
    if (!customId) {
        return NextResponse.json({
            type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE,
        });
    }

    const parts = customId.split(':');
    const threadId = parts[1];
    if (!threadId) {
        return NextResponse.json({
            type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE,
        });
    }

    const expiresInMinutes = parts[2] ? Number(parts[2]) : DEFAULT_EXPIRES_IN_MINUTES;
    const maxEdits = parts[3] ? Number(parts[3]) : DEFAULT_MAX_EDITS;

    const response = NextResponse.json({
        type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE,
    });

    doAsync(async () => {
        try{
            const data = await createEditSession(expiresInMinutes, maxEdits);
            if (data === null) {
                await sendFollowupMessage(
                    appId,
                    token,
                    'アクティブな編集セッションが十分に残っています',
                    true,
                );
                return;
            }
            await sendMessage(
                threadId,
                `編集リンク: ${data.url}`
            );
        } catch (err) {
            console.error('Button followup failed:', err);
            await sendFollowupMessage(
                appId,
                token,
                'エラーが発生しました',
                true
            ).catch(() => {});
        }
    });

    return response;
}

function doAsync(fn: () => Promise<void>): void {
    fn().catch(console.error);
}