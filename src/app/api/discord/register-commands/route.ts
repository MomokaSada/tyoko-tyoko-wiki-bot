import { NextRequest, NextResponse } from "next/server";
import { COMMANDS } from "@/discord/lib/commands";
import { registerCommand } from "@/discord/lib/rest";

export async function POST(
    _request: NextRequest
) {
    const appId = process.env.DISCORD_APP_ID;
    const botToken = process.env.DISCORD_BOT_TOKEN;

    if (!appId || !botToken) {
        return NextResponse.json(
            {
                error: 'DISCORD_APP_ID or DISCORD_BOT_TOKEN is not set'
            },
            {
                status: 500
            },
        );
    }

    const results = [];

    for (const command of COMMANDS) {
        const res = await registerCommand(
            appId,
            command,
        );

        results.push({
            command: command.name,
            status: res.status,
            data: res.data,
        });
    }

    return NextResponse.json(
        { results },
        {status: 200}
    )
}