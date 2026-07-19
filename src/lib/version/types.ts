export interface Version {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
  build?: string;
}

export type ReleaseType = "major" | "minor" | "patch" | "custom";

export type ChangeCategory =
  | "added"
  | "changed"
  | "deprecated"
  | "removed"
  | "fixed"
  | "security"
  | "performance"
  | "refactored"
  | "infrastructure"
  | "seo"
  | "accessibility"
  | "documentation"
  | "dx";

export interface ChangelogEntry {
  type: ChangeCategory;
  description: string;
  author?: string;
  commit?: string;
}

export interface GitInfo {
  commit: string;
  shortHash: string;
  branch: string;
  commitCount: number;
  isDirty: boolean;
}

export interface BuildInfo {
  version: string;
  buildNumber: number;
  git: GitInfo;
  buildTime: number;
  buildDate: string;
  nodeVersion: string;
  nextVersion: string;
  environment: "production" | "staging" | "development";
}

export interface ReleaseManifest {
  version: string;
  buildNumber: number;
  gitCommit: string;
  buildDate: string;
  environment: "production" | "staging" | "development";
  features: string[];
  fixes: string[];
  breakingChanges: string[];
  security: string[];
  performance: string[];
  infrastructure: string[];
}

export type DeploymentStatus = "success" | "failed" | "rolled_back";

export interface DeploymentRecord {
  version: string;
  buildNumber: number;
  deployedAt: string;
  server: string;
  environment: string;
  status: DeploymentStatus;
  rollback?: {
    fromVersion: string;
    rolledBackAt: string;
    reason: string;
  };
}
