/**
 * アプリ固有の型定義。
 *
 * InteractionType / InteractionResponseType / InteractionResponseFlags など
 * 汎用の enum・型は `discord-interactions` パッケージから import して使う。
 * ここではカスタム ID のパース結果など、アプリ独自の構造だけを定義する。
 */

/** ボタンの custom_id をパースした結果 */
export type CreateEditLinkPayload = {
  threadId: string;
  expiresInMinutes: number;
  maxEdits: number;
};
