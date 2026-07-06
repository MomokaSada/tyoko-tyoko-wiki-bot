import { DISCORD_API_BASE } from "@/discord/lib/constants";

async function discordFetch(
    method: string,
    path: string,
    body?: unknown,
): Promise<Response> {
    const url = `${DISCORD_API_BASE}${path}`;
    const headers: Record<string, string> = {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN!}`,
    };

    if (body) {
        headers['Content-Type'] = 'application/json';
    }

    return fetch(
        url,
        {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        }
    );
}

export async function createThread(
    channelId: string,
    name: string,
): Promise<string> {
    const res = await discordFetch(
        'POST',
        `/channels/${channelId}/threads`,
        {
            name,
            type: 11,
            auto_archive_duration: 1440,
        }
    );

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Failed to create thread: ${err}`);
    }

    const data = await res.json();
    return data.id as string;
}

export async function sendMessage(
    channelId: string,
    content: string,
): Promise<void> {
    const res = await discordFetch(
        'POST',
        `/channels/${channelId}/messages`, 
        {
        content
        }
    );

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Failed to send message: ${err}`);
    }
}

export async function sendFollowupMessage(
    applicationId: string,
    interactionToken: string,
    contentOrPayload: string | Record<string, unknown>,
    ephemeral = false,
): Promise<void> {
    const body = typeof contentOrPayload === 'string'
        ? { content: contentOrPayload, ...(ephemeral ? { flags: 64 } : {}) }
        : contentOrPayload;

    const res = await discordFetch(
        'POST',
        `/webhooks/${applicationId}/${interactionToken}`,
        body,
    );

    if (!res.ok) {
        throw new Error(`Failed to send followup: ${await res.text()}`);
    }
}

export async function editOriginalMessage(
    applicationId: string,
    interactionToken: string,
    content: string,
    components: unknown[],
): Promise<void> {
    const body = {
        content,
        components
    }
    const res = await discordFetch(
        'PATCH',
        `/webhooks/${applicationId}/${interactionToken}/messages/@original`,
        body,
    );

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Failed to edit original message: ${err}`);
    }
}

export async function registerCommand(
    applicationId: string,
    {
        name,
        description,
        options,
    }: {
        name: string;
        description: string;
        options?: ReadonlyArray<{
            type: number;
            name: string;
            description: string;
        }>;
    }
) {
    const body = {
        name,
        description,
        options,
    }
    const res = await discordFetch(
        'POST',
        `/applications/${applicationId}/commands`,
        body
    );

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Failed to register command: ${err}`);
    }

    return {
        status: res.status,
        data: await res.json() as Record<string, unknown>,
    };
}