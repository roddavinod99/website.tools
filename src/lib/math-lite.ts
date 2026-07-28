// Math evaluation library - uses dynamic import to avoid bundling mathjs (~250KB) in main chunk
// Only loaded when Math Evaluator tool is used

let mathInstance: ReturnType<typeof import("mathjs")["create"]> | null = null;
let mathImportPromise: Promise<typeof import("mathjs")> | null = null;

async function getMathInstance() {
  if (mathInstance) return mathInstance;
  
  if (!mathImportPromise) {
    mathImportPromise = import("mathjs");
  }
  
  const mathjs = await mathImportPromise;
  
  mathInstance = mathjs.create({
    ...mathjs.typedDependencies,
    ...mathjs.parseDependencies,
    ...mathjs.evaluateDependencies,
    ...mathjs.addDependencies,
    ...mathjs.subtractDependencies,
    ...mathjs.multiplyDependencies,
    ...mathjs.divideDependencies,
    ...mathjs.powDependencies,
    ...mathjs.modDependencies,
    ...mathjs.unaryMinusDependencies,
    ...mathjs.unaryPlusDependencies,
    ...mathjs.sqrtDependencies,
    ...mathjs.absDependencies,
    ...mathjs.ceilDependencies,
    ...mathjs.floorDependencies,
    ...mathjs.sinDependencies,
    ...mathjs.cosDependencies,
    ...mathjs.tanDependencies,
    ...mathjs.logDependencies,
    ...mathjs.log10Dependencies,
    ...mathjs.log2Dependencies,
    ...mathjs.piDependencies,
    ...mathjs.eDependencies,
    ...mathjs.factorialDependencies,
    ...mathjs.roundDependencies,
    ...mathjs.expDependencies,
  });
  
  return mathInstance;
}

export async function limitedEvaluate(expr: string, scope?: Record<string, unknown>): Promise<unknown> {
  const math = await getMathInstance();
  return math.evaluate(expr, scope);
}
