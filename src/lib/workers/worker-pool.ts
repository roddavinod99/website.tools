type WorkerTask = {
  id: string;
  type: string;
  data: unknown;
};

type WorkerResult = {
  id: string;
  type: string;
  result: unknown;
  error?: string;
};

export class WorkerPool {
  private workers: Worker[] = [];
  private queue: Array<{ task: WorkerTask; resolve: (result: WorkerResult) => void; reject: (error: Error) => void }> = [];
  private pending = new Map<string, { resolve: (result: WorkerResult) => void; reject: (error: Error) => void }>();
  private busyWorkers = new Set<Worker>();
  private maxWorkers: number;

  constructor(workerUrl: string | URL, maxWorkers?: number) {
    this.maxWorkers = maxWorkers || Math.min(navigator.hardwareConcurrency || 4, 4);
    for (let i = 0; i < this.maxWorkers; i++) {
      const worker = new Worker(workerUrl, { type: 'module' });
      worker.onmessage = (e) => this.onWorkerMessage(worker, e.data);
      worker.onerror = (e) => this.onWorkerError(worker, e);
      this.workers.push(worker);
    }
  }

  async execute(type: string, data: unknown): Promise<WorkerResult> {
    return new Promise((resolve, reject) => {
      const task: WorkerTask = { id: crypto.randomUUID(), type, data };
      this.queue.push({ task, resolve, reject });
      this.dispatch();
    });
  }

  private dispatch() {
    if (this.queue.length === 0) return;
    const idle = this.workers.filter(w => !this.busyWorkers.has(w));
    if (idle.length === 0) return;
    const worker = idle[0];
    const item = this.queue.shift()!;
    this.pending.set(item.task.id, { resolve: item.resolve, reject: item.reject });
    this.busyWorkers.add(worker);
    worker.postMessage(item.task);
  }

  private onWorkerMessage(worker: Worker, result: WorkerResult) {
    this.busyWorkers.delete(worker);
    const pending = this.pending.get(result.id);
    if (pending) {
      this.pending.delete(result.id);
      if (result.error) {
        pending.reject(new Error(result.error));
      } else {
        pending.resolve(result);
      }
    }
    this.dispatch();
  }

  private onWorkerError(worker: Worker, event: ErrorEvent) {
    this.busyWorkers.delete(worker);
    console.error('Worker error:', event.message);
    this.dispatch();
  }

  terminate() {
    this.workers.forEach(w => w.terminate());
    this.workers = [];
    this.busyWorkers.clear();
    this.pending.forEach(item => item.reject(new Error('Worker pool terminated')));
    this.pending.clear();
    this.queue.forEach(item => item.reject(new Error('Worker pool terminated')));
    this.queue = [];
  }
}
