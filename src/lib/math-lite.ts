// Lightweight, dependency-free math expression evaluator (browser-native).
// Implements the subset of mathjs behaviour this tool advertises:
// + - * / % ^, unary signs, parentheses, postfix factorial, functions and scope locals.

type Token =
  | { type: "number"; value: number }
  | { type: "ident"; value: string }
  | { type: "op"; value: string };

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
};

const FUNCTIONS: Record<string, (...args: number[]) => number> = {
  sqrt: Math.sqrt,
  abs: Math.abs,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  exp: Math.exp,
  log: Math.log10,
  log10: Math.log10,
  log2: Math.log2,
  ln: Math.log,
  ceil: Math.ceil,
  floor: Math.floor,
  round: Math.round,
  min: Math.min,
  max: Math.max,
  factorial: (n: number) => {
    if (!Number.isInteger(n) || n < 0) return NaN;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  },
};

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const ch = input[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      const m = input.slice(i).match(/^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/);
      if (!m) throw new Error("Invalid number");
      tokens.push({ type: "number", value: parseFloat(m[0]) });
      i += m[0].length;
      continue;
    }
    if (/[a-zA-Z_]/.test(ch)) {
      const m = input.slice(i).match(/^[a-zA-Z_]\w*/);
      tokens.push({ type: "ident", value: m![0] });
      i += m![0].length;
      continue;
    }
    if ("+-*/%^()!,".includes(ch)) {
      tokens.push({ type: "op", value: ch });
      i++;
      continue;
    }
    throw new Error(`Unexpected character: ${ch}`);
  }
  return tokens;
}

type Scope = Record<string, number | ((...args: number[]) => number)>;

export function evaluateExpression(expr: string, scope: Scope = {}): number {
  const tokens = tokenize(expr);
  let pos = 0;

  function peek(): Token | undefined {
    return tokens[pos];
  }

  function consume(): Token {
    if (pos >= tokens.length) throw new Error("Unexpected end of expression");
    return tokens[pos++];
  }

  function expectOp(value: string): void {
    const t = peek();
    if (!t || t.type !== "op" || t.value !== value) throw new Error(`Expected "${value}"`);
    pos++;
  }

  function parsePrimary(): number {
    const t = consume();
    if (t.type === "number") return t.value;
    if (t.type === "ident") {
      const next = peek();
      if (next && next.type === "op" && next.value === "(") {
        expectOp("(");
        const args: number[] = [];
        if (!(peek() && peek()!.type === "op" && peek()!.value === ")")) {
          do {
            args.push(parseExpr());
          } while (peek() && peek()!.type === "op" && peek()!.value === "," && (pos++, true));
        }
        expectOp(")");
        const fn: ((...args: number[]) => number) | undefined =
          FUNCTIONS[t.value] ?? (typeof scope[t.value] === "function" ? (scope[t.value] as (...args: number[]) => number) : undefined);
        if (!fn) throw new Error(`Unknown function: ${t.value}`);
        return fn(...args);
      }
      if (t.value in CONSTANTS) return CONSTANTS[t.value];
      if (typeof scope[t.value] === "number") return scope[t.value] as number;
      throw new Error(`Unknown variable: ${t.value}`);
    }
    if (t.type === "op" && t.value === "(") {
      const v = parseExpr();
      expectOp(")");
      return v;
    }
    throw new Error("Invalid expression");
  }

  function parsePostfix(): number {
    let value = parsePrimary();
    while (peek() && peek()!.type === "op" && peek()!.value === "!") {
      pos++;
      value = FUNCTIONS.factorial(value);
    }
    return value;
  }

  function parseUnary(): number {
    const t = peek();
    if (t && t.type === "op" && (t.value === "+" || t.value === "-")) {
      pos++;
      const operand = parseUnary();
      return t.value === "-" ? -operand : operand;
    }
    return parsePower();
  }

  function parsePower(): number {
    const base = parsePostfix();
    if (peek() && peek()!.type === "op" && peek()!.value === "^") {
      pos++;
      const exponent = parseUnary();
      return Math.pow(base, exponent);
    }
    return base;
  }

  function parseMultiplicative(): number {
    let value = parseUnary();
    while (true) {
      const t = peek();
      if (!t || t.type !== "op") break;
      if (t.value === "*" || t.value === "/" || t.value === "%") {
        pos++;
        const rhs = parseUnary();
        value = t.value === "*" ? value * rhs : t.value === "/" ? value / rhs : value % rhs;
      } else {
        break;
      }
    }
    return value;
  }

  function parseAdditive(): number {
    let value = parseMultiplicative();
    while (true) {
      const t = peek();
      if (!t || t.type !== "op") break;
      if (t.value === "+" || t.value === "-") {
        pos++;
        const rhs = parseMultiplicative();
        value = t.value === "+" ? value + rhs : value - rhs;
      } else {
        break;
      }
    }
    return value;
  }

  function parseExpr(): number {
    return parseAdditive();
  }

  const result = parseExpr();
  if (pos !== tokens.length) throw new Error("Unexpected token");
  if (typeof result !== "number" || !Number.isFinite(result)) throw new Error("Invalid expression");
  return result;
}

let mathInstance: { evaluate: (expr: string, scope: Scope) => number } | null = null;

// Kept as a Promise for compatibility with the previous dynamic-import API.
async function getMathInstance() {
  if (!mathInstance) {
    mathInstance = {
      evaluate: (expr: string, scope: Scope = {}) => evaluateExpression(expr, scope),
    };
  }
  return mathInstance;
}

export async function limitedEvaluate(expr: string, scope?: Record<string, unknown>): Promise<unknown> {
  const math = await getMathInstance();
  return math.evaluate(expr, scope as Scope);
}