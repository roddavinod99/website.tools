export const learningTopics = [
  { title: "Getting Started with JSON", description: "Learn the fundamentals of JSON syntax, structure, and common use cases in modern web development.", slug: "getting-started-json", readTime: "5 min", category: "JSON" },
  { title: "Understanding JWT Tokens", description: "A comprehensive guide to JSON Web Tokens, how they work, and best practices for implementation.", slug: "understanding-jwt", readTime: "8 min", category: "JWT & Security" },
  { title: "Image Optimization Guide", description: "Best practices for optimizing images for the web without sacrificing quality.", slug: "image-optimization-guide", readTime: "6 min", category: "Web Performance" },
  { title: "Password Security Best Practices", description: "How to create and manage secure passwords, plus common pitfalls to avoid.", slug: "password-security", readTime: "4 min", category: "JWT & Security" },
  { title: "Understanding Base64 Encoding", description: "What Base64 is, how it works, and when to use it in web development.", slug: "understanding-base64", readTime: "6 min", category: "Encodings" },
  { title: "CSS Minification Guide", description: "How to minify CSS for production and why it matters for performance.", slug: "css-minification-guide", readTime: "5 min", category: "Web Performance" },
  { title: "Regex Fundamentals", description: "Learn regular expressions from basics to advanced patterns with practical examples.", slug: "regex-fundamentals", readTime: "10 min", category: "Dev Techniques" },
  { title: "Unix Timestamps Explained", description: "Everything you need to know about Unix timestamps, timezones, and date handling.", slug: "unix-timestamps-explained", readTime: "7 min", category: "Data Formats" },
  { title: "HTML Encoding & Special Characters", description: "A guide to HTML entities, special characters, and why encoding matters for security.", slug: "html-encoding-guide", readTime: "5 min", category: "Encodings" },
  { title: "Data Serialization Formats", description: "Compare JSON, YAML, TOML, and XML to choose the right format for your project.", slug: "data-serialization-formats", readTime: "8 min", category: "Data Formats" },
];

export const learningCategories = Array.from(
  learningTopics.reduce((acc, topic) => {
    acc.set(topic.category, (acc.get(topic.category) ?? 0) + 1);
    return acc;
  }, new Map<string, number>()),
  ([name, count]) => ({ name, count })
);
