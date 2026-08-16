import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { parseFaqItem, parseFaqItems } from "@/lib/faq";

describe("parseFaqItem", () => {
  it("parses em-dash format", () => {
    expect(parseFaqItem("What is JSON? — It's a data format.")).toEqual({
      question: "What is JSON?",
      answer: "It's a data format.",
    });
  });

  it("preserves an em dash inside the answer", () => {
    expect(parseFaqItem("Why? — Because of A — and B.")).toEqual({
      question: "Why?",
      answer: "Because of A — and B.",
    });
  });

  it("parses the legacy pipe format", () => {
    expect(parseFaqItem("Is it free? | A: Yes, always.")).toEqual({
      question: "Is it free?",
      answer: "Yes, always.",
    });
  });

  it("parses separator-less 'Question? Answer.' format", () => {
    expect(
      parseFaqItem("What is the cost rounds parameter? It determines how many times the algorithm iterates.")
    ).toEqual({
      question: "What is the cost rounds parameter?",
      answer: "It determines how many times the algorithm iterates.",
    });
  });

  it("keeps additional question marks inside the answer", () => {
    expect(parseFaqItem("Does this include tax? Only if you include tax in the bill amount.")).toEqual({
      question: "Does this include tax?",
      answer: "Only if you include tax in the bill amount.",
    });
  });

  it("splits on a question mark not followed by a space", () => {
    expect(parseFaqItem("Is it secure?Yes")).toEqual({
      question: "Is it secure?",
      answer: "Yes",
    });
  });

  it("trims surrounding whitespace", () => {
    expect(parseFaqItem("  Q?  A.  ")).toEqual({ question: "Q?", answer: "A." });
  });

  it("falls back to a question-only entry when no separator exists", () => {
    expect(parseFaqItem("Just a question")).toEqual({ question: "Just a question", answer: "" });
  });
});

describe("parseFaqItems", () => {
  it("maps an array of raw strings through the parser", () => {
    expect(parseFaqItems(["A? B.", "C — D"])).toEqual([
      { question: "A?", answer: "B." },
      { question: "C", answer: "D" },
    ]);
  });
});

describe("FAQ content data integrity", () => {
  const dir = join(__dirname, "../src/content/tools");
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));

  it("every FAQ item across all tools parses to a non-empty question and answer", () => {
    const broken: string[] = [];

    for (const file of files) {
      const content = JSON.parse(readFileSync(join(dir, file), "utf8")) as {
        faq?: unknown[];
      };
      if (!Array.isArray(content.faq)) continue;

      content.faq.forEach((item: unknown, i: number) => {
        if (typeof item !== "string") {
          broken.push(`${file}[${i}] is not a string`);
          return;
        }
        const { question, answer } = parseFaqItem(item);
        if (!question.trim() || !answer.trim()) {
          broken.push(`${file}[${i}] → missing question or answer: "${item.slice(0, 60)}"`);
        }
      });
    }

    expect(broken).toEqual([]);
  });
});
