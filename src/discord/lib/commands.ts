import { DEFAULT_EXPIRES_IN_MINUTES, DEFAULT_MAX_EDITS } from "@/discord/lib/constants";
import { humanizeMinutes } from "@/lib/utils";

export const SET_COMMAND = {
    name: 'set',
    description: '項目編集リンク発行用のスレッドを作成します',
    options: [
        {
            type: 4, // INTEGER
            name: 'expires_in',
            description: `有効期限（分）デフォルト: ${DEFAULT_EXPIRES_IN_MINUTES}（${humanizeMinutes(DEFAULT_EXPIRES_IN_MINUTES)}）`,
            min_value: 5,
            max_value: 10080,
            required: false,
        },
        {
            type: 4,
            name: 'max_edits',
            description: `最大編集回数 デフォルト: ${DEFAULT_MAX_EDITS}`,
            min_value: 1,
            max_value: 500,
            required: false,
        },
    ],
} as const;

export const COMMANDS = [
    SET_COMMAND
] as const;