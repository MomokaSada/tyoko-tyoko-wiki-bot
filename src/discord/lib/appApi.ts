import { EditSessionResponseSchema } from "@/discord/schemas/editSession";


const APP_API_URL = process.env.APP_API_URL!;
const APP_API_TOKEN = process.env.APP_API_BOT_TOKEN!;

async function appFech(
    method: string,
    path: string,
    body?: unknown,
): Promise<Response> {
    return fetch (
        `${APP_API_URL}${path}`,
        {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${APP_API_TOKEN}`,
            },
            body: body ? JSON.stringify(body) : undefined,
        }
    );
}

export async function createEditSession(
    expiresInMinutes: number,
    maxEdits: number,
) {
    const body : Record<string, number> = {};
    body.expiresInMinutes = expiresInMinutes;
    body.maxEdits = maxEdits;

    const res = await appFech(
        'POST',
        '/api/bot/edit-sessions',
        body
    );

    if (res.ok) {
        return EditSessionResponseSchema.parse(await res.json());
    }

    if (res.status === 409){
        return null;
    }

    throw new Error(`Failed to create edit session: ${await res.text()}`);
}