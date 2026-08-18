import "server-only";

export const PRODUCTION_ADMIN_ENV_FLAG = "PXWS_PRODUCTION_ADMIN";
export const PRODUCTION_ADMIN_CONFIG_PATH = "wrangler.production-admin.jsonc";
export const PRODUCTION_D1_NAME = "projectx-websites-production";
export const PRODUCTION_D1_ID = "db47d1af-bc9c-47f0-ad8a-1377971dbd24";

export function isProductionAdminMode(): boolean {
  return process.env[PRODUCTION_ADMIN_ENV_FLAG] === "1";
}
