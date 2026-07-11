"use client";

import { useState } from "react";

interface CheatItem { cmd: string; desc: string; example?: string }

const SECTIONS: { title: string; items: CheatItem[] }[] = [
  { title: "Configuration", items: [
    { cmd: "git config --global user.name", desc: "Set global username" },
    { cmd: "git config --global user.email", desc: "Set global email" },
    { cmd: "git config --global core.editor", desc: "Set default editor" },
    { cmd: "git config --list", desc: "Show all config settings" },
  ]},
  { title: "Getting Started", items: [
    { cmd: "git init", desc: "Initialize a new repository" },
    { cmd: "git clone <url>", desc: "Clone a remote repository" },
    { cmd: "git clone --depth 1 <url>", desc: "Shallow clone (latest commit only)" },
  ]},
  { title: "Staging & Committing", items: [
    { cmd: "git add <file>", desc: "Stage a file", example: "git add src/app.ts" },
    { cmd: "git add .", desc: "Stage all changes" },
    { cmd: "git add -p", desc: "Stage interactively (hunk by hunk)" },
    { cmd: "git commit -m \"message\"", desc: "Commit staged changes", example: 'git commit -m "Fix login bug"' },
    { cmd: "git commit -am \"message\"", desc: "Stage tracked files and commit" },
    { cmd: "git commit --amend", desc: "Amend the last commit" },
    { cmd: "git commit --amend --no-edit", desc: "Amend last commit without changing message" },
  ]},
  { title: "Branching", items: [
    { cmd: "git branch", desc: "List local branches" },
    { cmd: "git branch -a", desc: "List all branches (local + remote)" },
    { cmd: "git branch <name>", desc: "Create a new branch" },
    { cmd: "git checkout <branch>", desc: "Switch to a branch" },
    { cmd: "git checkout -b <branch>", desc: "Create and switch to a new branch" },
    { cmd: "git switch <branch>", desc: "Switch to a branch (modern)" },
    { cmd: "git switch -c <branch>", desc: "Create and switch (modern)" },
    { cmd: "git branch -d <branch>", desc: "Delete a merged branch" },
    { cmd: "git branch -D <branch>", desc: "Force delete a branch" },
  ]},
  { title: "Merging & Rebasing", items: [
    { cmd: "git merge <branch>", desc: "Merge a branch into current" },
    { cmd: "git merge --no-ff <branch>", desc: "Merge with a merge commit" },
    { cmd: "git rebase <branch>", desc: "Rebase current branch onto another" },
    { cmd: "git rebase --abort", desc: "Abort an in-progress rebase" },
    { cmd: "git cherry-pick <hash>", desc: "Apply a specific commit" },
  ]},
  { title: "Remote Repositories", items: [
    { cmd: "git remote -v", desc: "List remote repositories" },
    { cmd: "git remote add origin <url>", desc: "Add a remote" },
    { cmd: "git push origin <branch>", desc: "Push to remote" },
    { cmd: "git push -u origin <branch>", desc: "Push and set upstream" },
    { cmd: "git pull", desc: "Fetch and merge from remote" },
    { cmd: "git pull --rebase", desc: "Fetch and rebase from remote" },
    { cmd: "git fetch", desc: "Fetch remote changes without merging" },
  ]},
  { title: "Undoing Changes", items: [
    { cmd: "git restore <file>", desc: "Discard working directory changes" },
    { cmd: "git restore --staged <file>", desc: "Unstage a file" },
    { cmd: "git reset HEAD~1", desc: "Undo last commit, keep changes staged" },
    { cmd: "git reset --hard HEAD~1", desc: "Undo last commit and discard changes" },
    { cmd: "git revert <hash>", desc: "Create a new commit that undoes a commit" },
    { cmd: "git stash", desc: "Stash working directory changes" },
    { cmd: "git stash pop", desc: "Apply stashed changes" },
    { cmd: "git stash list", desc: "List all stashes" },
  ]},
  { title: "Inspecting History", items: [
    { cmd: "git log", desc: "View commit history" },
    { cmd: "git log --oneline", desc: "Compact one-line log" },
    { cmd: "git log --graph --oneline", desc: "Graphical branch history" },
    { cmd: "git log --since=\"2 weeks ago\"", desc: "Commits from last 2 weeks" },
    { cmd: "git diff", desc: "Show unstaged changes" },
    { cmd: "git diff --staged", desc: "Show staged changes" },
    { cmd: "git diff <branch1>..<branch2>", desc: "Compare two branches" },
    { cmd: "git show <hash>", desc: "Show details of a commit" },
    { cmd: "git blame <file>", desc: "Show who last modified each line" },
  ]},
  { title: "Tagging", items: [
    { cmd: "git tag <name>", desc: "Create a lightweight tag" },
    { cmd: "git tag -a <name> -m \"msg\"", desc: "Create an annotated tag" },
    { cmd: "git tag -a <name> <hash>", desc: "Tag a specific commit" },
    { cmd: "git push origin <tag>", desc: "Push a tag to remote" },
    { cmd: "git push origin --tags", desc: "Push all tags" },
  ]},
  { title: "Useful Aliases", items: [
    { cmd: "git config --global alias.st status", desc: "git st → git status" },
    { cmd: "git config --global alias.co checkout", desc: "git co → git checkout" },
    { cmd: "git config --global alias.br branch", desc: "git br → git branch" },
    { cmd: "git config --global alias.lg \"log --oneline --graph\"", desc: "git lg → pretty log" },
  ]},
];

export function GitCheatsheet() {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = SECTIONS.map(s => ({
    ...s,
    items: search ? s.items.filter(i => i.cmd.toLowerCase().includes(search.toLowerCase()) || i.desc.toLowerCase().includes(search.toLowerCase())) : s.items,
  })).filter(s => s.items.length > 0);

  return (
    <div className="space-y-4">
      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search commands..."
        className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />

      <div className="space-y-3">
        {filtered.map(section => (
          <div key={section.title} className="rounded-lg border border-surface-200 dark:border-dark-border overflow-hidden">
            <button onClick={() => setExpanded(expanded === section.title ? null : section.title)}
              className="w-full flex items-center justify-between p-3 text-left bg-surface-50 dark:bg-dark-surface hover:bg-surface-100 dark:hover:bg-dark-border transition-colors">
              <span className="text-sm font-medium text-surface-900 dark:text-dark-text">{section.title} ({section.items.length})</span>
              <span className="text-surface-400 dark:text-dark-muted">{expanded === section.title ? "−" : "+"}</span>
            </button>
            {(expanded === section.title || search) && (
              <div className="divide-y divide-surface-200 dark:divide-dark-border">
                {section.items.map((item, i) => (
                  <div key={i} className="px-3 py-2">
                    <code className="text-xs font-mono text-brand-600 dark:text-brand-400">{item.cmd}</code>
                    <p className="text-xs text-surface-600 dark:text-dark-muted mt-0.5">{item.desc}</p>
                    {item.example && <code className="text-[10px] font-mono text-surface-400 dark:text-dark-muted mt-0.5 block">{item.example}</code>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
