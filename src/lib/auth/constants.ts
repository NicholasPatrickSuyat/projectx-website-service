export const ADMIN_SESSION_COOKIE = "pxws_admin_session";
export const ADMIN_SESSION_TTL_SECONDS = 12 * 60 * 60;
export const ADMIN_AUTH_ERROR = "You must be signed in to continue.";
export const INVALID_CREDENTIALS_ERROR = "Those credentials are incorrect.";
export const SIGN_IN_UNAVAILABLE_ERROR =
  "Sign-in is unavailable. Check the local authentication configuration.";
export const LOGIN_THROTTLED_ERROR =
  "Sign-in is temporarily unavailable. Try again later.";

export const PBKDF2_ITERATIONS = 600_000;
export const PBKDF2_SALT_BYTES = 16;
export const PBKDF2_KEY_BITS = 256;
export const SESSION_SECRET_MIN_BYTES = 32;

export const AUTH_USERNAME_MAX_LENGTH = 64;
export const AUTH_PASSWORD_MAX_LENGTH = 256;

export const LOGIN_MAX_FAILURES = 5;
export const LOGIN_WINDOW_SECONDS = 15 * 60;
export const LOGIN_LOCKOUT_SECONDS = 15 * 60;
