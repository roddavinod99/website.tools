const NODE_ENV = process.env.NODE_ENV || "development";
const IS_PRODUCTION = NODE_ENV === "production";

export function getEnvVar(name: string, options?: { required?: boolean; defaultValue?: string }): string {
  const value = process.env[name];

  if (value !== undefined && value !== "") {
    return value;
  }

  if (options?.defaultValue !== undefined) {
    return options.defaultValue;
  }

  if (options?.required !== false && IS_PRODUCTION) {
    throw new Error(
      `Environment variable "${name}" is required but not set. ` +
        `Add it to your .env file or set it in the environment.`
    );
  }

  if (IS_PRODUCTION) {
    console.error(`WARNING: Environment variable "${name}" is not set. Set a secure random value in production.`);
  }

  return "";
}

export function getIPHashSalt(): string {
  return getEnvVar("IP_HASH_SALT", { required: true });
}

export function getSiteUrl(): string {
  return getEnvVar("NEXT_PUBLIC_SITE_URL", {
    defaultValue: "https://tools.devstackio.com",
  });
}

export function isRateLimitDisabled(): boolean {
  return process.env.DISABLE_RATE_LIMIT === "true";
}
