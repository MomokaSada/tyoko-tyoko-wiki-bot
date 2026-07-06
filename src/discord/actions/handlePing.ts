import { NextResponse } from "next/server";
import { InteractionResponseType } from "discord-interactions";

export function handlePing() {
    return NextResponse.json({
        type: InteractionResponseType.PONG
    });
}