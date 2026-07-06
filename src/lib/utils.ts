import camelcaseKeys from 'camelcase-keys';
import humanizeDuration from 'humanize-duration';
import type { CamelCaseKeys } from 'camelcase-keys';

/**
 * オブジェクトのキーを再帰的に camelCase に変換する。
 * 戻り値の型も camelCase に変換される。
 */
export function keysToCamelCase<T extends Record<string, unknown>>(
  obj: T,
): CamelCaseKeys<T, true> {
  return camelcaseKeys(obj, { deep: true }) as CamelCaseKeys<T, true>;
}

export function humanizeMinutes(
    minutes: number
) {
    return humanizeDuration(
        minutes * 60 * 1000,
        {
            language: 'ja'
        }
    );
}