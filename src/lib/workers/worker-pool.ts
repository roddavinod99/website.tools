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
  private taskQueue: Array<{ task: WorkerTask; resolve: (result: WorkerResult) => void; reject: (error: Error) => void }> = [];
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
      this.taskQueue.push({ task, resolve, reject });
      this.dispatch();
    });
  }

  private dispatch() {
    const idle = this.workers.filter(w => !this.busyWorkers.has(w));
    if (idle.length === 0 || this.taskQueue.length === 0) return;
    const worker = idle[0];
    const item = this.taskQueue.shift()!;
    this.busyWorkers.add(worker);
    worker.postMessage(item.task);
  }

  private onWorkerMessage(worker: Worker, result: WorkerResult) {
    this.busyWorkers.delete(worker);
    const item = this.taskQueue.find(q => q.task.id === result.id);
    if (item) {
      this.taskQueue = this.taskQueue.filter(q => q.task.id !== result.id);
      item.resolve(result);
    }
    this.dispatch();
  }

  private onWorkerError(worker: Worker, event: ErrorEvent) {
    this.busyWorkers.delete(worker);
    console.error('Worker error:', event);
    this.dispatch();
  }

  terminate() {
    this.workers.forEach(w => w.terminate());
    this.workers = [];
    this.busyWorkers.clear();
    this.taskQueue.forEach(item => item.reject(new Error('Worker pool terminated')));
    this.taskQueue = [];
  }
}
