export interface FaqEntry {
  question: string;
  answer: string;
}

/**
 * Parses a raw FAQ string into { question, answer }.
 *
 * FAQ content files historically use one of three conventions:
 *   - "Question — Answer"            (em dash)
 *   - "Question | A: Answer"         (legacy pipe format)
 *   - "Question? Answer."            (no separator; split on the first "?")
 *
 * The em-dash and pipe formats are split on their first occurrence so any
 * separator appearing inside the answer is preserved. For the separator-less
 * format the question is assumed to end at the first "?".
 */
export function parseFaqItem(raw: string): FaqEntry {
  const s = raw.trim();

  const emDashIndex = s.indexOf(" — ");
  if (emDashIndex !== -1) {
    return {
      question: s.slice(0, emDashIndex).trim(),
      answer: s.slice(emDashIndex + 3).trim(),
    };
  }

  const pipeIndex = s.indexOf(" | A:");
  if (pipeIndex !== -1) {
    return {
      question: s.slice(0, pipeIndex).trim(),
      answer: s.slice(pipeIndex + 5).trim(),
    };
  }

  const questionMarkIndex = s.indexOf("?");
  if (questionMarkIndex !== -1) {
    return {
      question: s.slice(0, questionMarkIndex + 1).trim(),
      answer: s.slice(questionMarkIndex + 1).trim(),
    };
  }

  return { question: s, answer: "" };
}

export function parseFaqItems(raws: string[]): FaqEntry[] {
  return raws.map(parseFaqItem);
}