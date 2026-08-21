## What is JSON?

JSON (JavaScript Object Notation) is a lightweight, text-based data interchange format that is easy for humans to read and write and easy for machines to parse and generate. It was originally derived from a subset of the JavaScript Programming Language, but it is now language-agnostic and supported natively by almost every programming language and platform. Because it represents data as plain text, JSON is ideal for transmitting structured information between a server and a web application over HTTP. You will encounter JSON everywhere: REST API responses, configuration files, NoSQL databases, browser storage, and tool-to-tool integrations.

## JSON Syntax

JSON data is always written as a collection of key-value pairs. Keys must be strings wrapped in double quotes, while values can be a string, number, boolean, null, object, or array. Objects are enclosed in curly braces and arrays in square brackets, which allows you to model arbitrarily complex, nested data structures. Numbers may be integers or floating point, but leading zeros and special JavaScript values like Infinity or NaN are not valid JSON. A common mistake is using single quotes or trailing commas; both are valid in JavaScript object literals but will cause a JSON parser to throw an error. Whitespace between tokens is allowed and often used for pretty-printing.

## Working with JSON in JavaScript

In JavaScript, use `JSON.parse()` to convert a JSON string into a live JavaScript object, and `JSON.stringify()` to serialize a JavaScript object back into a JSON string. Both methods are available in every modern browser and in Node.js, and they accept optional parameters for revivers, replacers, and pretty-print indentation. `JSON.parse()` throws a `SyntaxError` on malformed input, so production code should wrap calls in try/catch or validate first. For large payloads, prefer a streaming parser to avoid blocking the main thread, which is why tools like our JSON formatter run in a Web Worker.

## JSON in APIs

JSON is the de facto standard for REST and GraphQL APIs because it is compact, readable, and universally supported. Most API responses are JSON objects, and API requests frequently include JSON payloads in the request body with the Content-Type header set to `application/json`. When designing an API, keep payloads flat where possible, use consistent naming conventions, and version your schemas so that changes do not break existing clients. Tools like our JSON Formatter and JSON to CSV converter make it easy to inspect, validate, and transform the data you receive from APIs before using it.