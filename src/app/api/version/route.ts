import { NextResponse } from "next/server";
import {
  RELEASE_VERSION,
  RELEASE_BUILD_NUMBER,
  RELEASE_GIT_SHORT_HASH,
  RELEASE_BUILD_DATE,
  RELEASE_ENVIRONMENT,
  RELEASE_GIT_COMMIT,
  RELEASE_GIT_BRANCH,
  RELEASE_GIT_COMMIT_COUNT,
  RELEASE_NODE_VERSION,
  RELEASE_NEXT_VERSION,
} from "@/lib/version/__generated__/release-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      version: RELEASE_VERSION,
      build: RELEASE_BUILD_NUMBER,
      commit: RELEASE_GIT_SHORT_HASH,
      commitFull: RELEASE_GIT_COMMIT,
      branch: RELEASE_GIT_BRANCH,
      commitCount: RELEASE_GIT_COMMIT_COUNT,
      buildDate: RELEASE_BUILD_DATE,
      environment: RELEASE_ENVIRONMENT,
      nodeVersion: RELEASE_NODE_VERSION,
      nextVersion: RELEASE_NEXT_VERSION,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
