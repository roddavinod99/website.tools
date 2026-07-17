export function scheduleIdlePreload(fn: () => Promise<unknown>) {
  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(() => { fn().catch(() => {}); }, { timeout: 2000 });
  } else {
    setTimeout(() => { fn().catch(() => {}); }, 1000);
  }
}
