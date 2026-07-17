type BenchmarkMessage = {
  id: string;
  type: "run";
  data: { code: string; iterations: number };
};

type BenchmarkResult = {
  id: string;
  type: "result";
  result: {
    totalTime: number;
    avgTime: number;
    minTime: number;
    maxTime: number;
    opsPerSec: number;
    iterations: number;
  };
};

self.onmessage = (e: MessageEvent<BenchmarkMessage>) => {
  const { id, type, data } = e.data;
  if (type !== "run") return;

  const { code, iterations } = data;
  const times: number[] = [];

  try {
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      const fn = new Function(code);
      fn();
      const end = performance.now();
      times.push(end - start);
    }

    const totalTime = times.reduce((a, b) => a + b, 0);
    const avgTime = totalTime / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const opsPerSec = avgTime > 0 ? 1000 / avgTime : Infinity;

    const result: BenchmarkResult = {
      id,
      type: "result",
      result: { totalTime, avgTime, minTime, maxTime, opsPerSec, iterations },
    };

    self.postMessage(result);
  } catch (err) {
    self.postMessage({
      id,
      type: "error",
      error: (err as Error).message,
    });
  }
};
