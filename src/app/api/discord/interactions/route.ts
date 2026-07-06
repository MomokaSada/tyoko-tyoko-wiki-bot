import { NextRequest, NextResponse } from "next/server";
import { InteractionType, InteractionResponseFlags, verifyKey } from "discord-interactions";
import { InteractionSchema } from "@/discord/schemas/interaction";
import { handlePing } from "@/discord/actions/handlePing";
import { handleSetCommand } from "@/discord/actions/handleSetCommand";
import { handleCreateEditLink } from "@/discord/actions/handleCreateEditLink";

export async function POST(
    request: NextRequest
) {
    const signature = request.headers.get('X-Signature-Ed25519') ?? '';
    const timestamp = request.headers.get('X-Signature-Timestamp') ?? '';
    const rawBody = await request.text();
    const publicKey = process.env.DISCORD_PUBLIC_KEY!;

    const isValid = await verifyKey(
        rawBody,
        signature,
        timestamp,
        publicKey
    );
    if (!isValid) {
        return new NextResponse(
            'Invalid signature',
            {
                status: 401
            }
        );
    }

    let interaction;
    try {
        interaction = InteractionSchema.parse(JSON.parse(rawBody));
    } catch {
        return NextResponse.json(
            {
                type: 4,
                data: {
                    content: 'Invalid payload',
                    flags: 64
                }
            },
            {
                status: 422
            }
        );
    }

    switch (interaction.type) {
        case InteractionType.PING:
            return handlePing();

        case InteractionType.APPLICATION_COMMAND:
            if (interaction.data?.name === 'set') {
                return handleSetCommand(interaction);
            }
            break;

        case InteractionType.MESSAGE_COMPONENT:
            if (interaction.data?.customId?.startsWith('create_edit_link:')) {
                return handleCreateEditLink(interaction);
            }
            break;
    }

    return NextResponse.json({
        type: 4,
        data: {
            content: 'Unknown interaction',
            flags: InteractionResponseFlags.EPHEMERAL
        },
    });
}