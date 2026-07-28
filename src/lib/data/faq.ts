import { allTools } from "./tools";
import { categoryMetas } from "./categories";

export const TOOL_COUNT = allTools.length;
export const categories = getCategories(allTools);

function getCategories(allTools: { category: string }[]) {
  return categoryMetas.map((c) => ({
    ...c,
    toolCount: allTools.filter((t) => t.category === c.name).length,
  }));
}

export const featuredTools = allTools.filter((t) => t.featured);

export const faqItems = [
  { question: "Are the tools really free?", answer: "Yes, all tools on DevStackIO are completely free. We believe developer tools should be accessible to everyone." },
  { question: "Do I need to create an account?", answer: "No. Every tool works without any account or login. Just open and use." },
  { question: "Is my data secure?", answer: "All processing happens in your browser. Your data never leaves your device, and we never store or share your information." },
  { question: "Can I use these tools offline?", answer: "Many tools work offline after the first load. We're working on expanding offline support." },
  { question: "How do you sustain the platform?", answer: "We're building a premium API for enterprise users. All web tools remain free forever." },
  { question: "How many tools are available?", answer: `We currently offer ${TOOL_COUNT} free tools across ${categories.length} categories, with new tools added regularly.` },
  { question: "Do you support mobile devices?", answer: "Yes, all tools are fully responsive and work on smartphones, tablets, and desktops." },
  { question: "Can I request a new tool?", answer: "Absolutely! Use the Suggest a Tool page to let us know what you need." },
];