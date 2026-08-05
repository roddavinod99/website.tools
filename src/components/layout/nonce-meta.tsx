import { headers } from "next/headers";

export async function NonceMeta() {
  const headersList = await headers();
  const nonce = headersList.get("x-middleware-nonce");

  if (!nonce) return undefined;

  return <meta name="csp-nonce" content={nonce} />;
}