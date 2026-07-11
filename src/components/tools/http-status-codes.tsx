"use client";

import { useState, useMemo } from "react";

interface StatusCode { code: number; name: string; description: string; type: string }

const HTTP_CODES: StatusCode[] = [
  { code: 100, name: "Continue", description: "The server has received the request headers and the client should proceed to send the request body.", type: "Informational" },
  { code: 101, name: "Switching Protocols", description: "The requester has asked the server to switch protocols and the server has agreed to do so.", type: "Informational" },
  { code: 102, name: "Processing", description: "The server has received and is processing the request, but no response is available yet.", type: "WebDAV" },
  { code: 103, name: "Early Hints", description: "Used to return some response headers before final HTTP message.", type: "Informational" },
  { code: 200, name: "OK", description: "Standard response for successful HTTP requests.", type: "Success" },
  { code: 201, name: "Created", description: "The request has been fulfilled, resulting in the creation of a new resource.", type: "Success" },
  { code: 202, name: "Accepted", description: "The request has been accepted for processing, but the processing has not been completed.", type: "Success" },
  { code: 203, name: "Non-Authoritative Information", description: "The server is a proxy transforming the 200 OK response.", type: "Success" },
  { code: 204, name: "No Content", description: "The server successfully processed the request and is not returning any content.", type: "Success" },
  { code: 205, name: "Reset Content", description: "The server successfully processed the request, but is not returning any content.", type: "Success" },
  { code: 206, name: "Partial Content", description: "The server is delivering only part of the resource due to a range header in the request.", type: "Success" },
  { code: 207, name: "Multi-Status", description: "The message body that follows is an XML message and can contain a number of separate response codes.", type: "WebDAV" },
  { code: 208, name: "Already Reported", description: "The members of a DAV binding have already been enumerated in a preceding reply.", type: "WebDAV" },
  { code: 226, name: "IM Used", description: "The server has fulfilled a request for the resource, and the response is a representation of the result.", type: "Success" },
  { code: 300, name: "Multiple Choices", description: "Indicates multiple options for the resource from which the client may choose.", type: "Redirection" },
  { code: 301, name: "Moved Permanently", description: "This and all future requests should be directed to the given URI.", type: "Redirection" },
  { code: 302, name: "Found", description: "Tells the client to look at another URL.", type: "Redirection" },
  { code: 303, name: "See Other", description: "The response can be found under a different URI using a GET method.", type: "Redirection" },
  { code: 304, name: "Not Modified", description: "Indicates the resource has not been modified since the version specified by the request headers.", type: "Redirection" },
  { code: 305, name: "Use Proxy", description: "The requested resource is available only through a proxy.", type: "Redirection" },
  { code: 306, name: "Switch Proxy", description: "No longer used. Reserved for future use.", type: "Redirection" },
  { code: 307, name: "Temporary Redirect", description: "The request should be repeated with another URI but future requests should still use the original URI.", type: "Redirection" },
  { code: 308, name: "Permanent Redirect", description: "The request and all future requests should be repeated using another URI.", type: "Redirection" },
  { code: 400, name: "Bad Request", description: "The server cannot or will not process the request due to an apparent client error.", type: "Client Error" },
  { code: 401, name: "Unauthorized", description: "Authentication is required and has either failed or not been provided.", type: "Client Error" },
  { code: 402, name: "Payment Required", description: "Reserved for future use.", type: "Client Error" },
  { code: 403, name: "Forbidden", description: "The request was valid, but the server is refusing action.", type: "Client Error" },
  { code: 404, name: "Not Found", description: "The requested resource could not be found but may be available in the future.", type: "Client Error" },
  { code: 405, name: "Method Not Allowed", description: "A request method is not supported for the requested resource.", type: "Client Error" },
  { code: 406, name: "Not Acceptable", description: "The requested resource is capable of generating content not acceptable according to the Accept headers.", type: "Client Error" },
  { code: 407, name: "Proxy Authentication Required", description: "The client must first authenticate itself with the proxy.", type: "Client Error" },
  { code: 408, name: "Request Timeout", description: "The server timed out waiting for the request from the client.", type: "Client Error" },
  { code: 409, name: "Conflict", description: "Indicates that the request could not be processed because of conflict in the current state of the resource.", type: "Client Error" },
  { code: 410, name: "Gone", description: "Indicates that the resource requested is no longer available and will not be available again.", type: "Client Error" },
  { code: 411, name: "Length Required", description: "The request did not specify the length of its content, which is required by the requested resource.", type: "Client Error" },
  { code: 412, name: "Precondition Failed", description: "The server does not meet one of the preconditions that the requester put on the request.", type: "Client Error" },
  { code: 413, name: "Payload Too Large", description: "The request is larger than the server is willing or able to process.", type: "Client Error" },
  { code: 414, name: "URI Too Long", description: "The URI provided was too long for the server to process.", type: "Client Error" },
  { code: 415, name: "Unsupported Media Type", description: "The request entity has a media type which the server or resource does not support.", type: "Client Error" },
  { code: 416, name: "Range Not Satisfiable", description: "The client has asked for a portion of the file, but the server cannot supply that portion.", type: "Client Error" },
  { code: 417, name: "Expectation Failed", description: "The server cannot meet the requirements of the Expect request-header field.", type: "Client Error" },
  { code: 418, name: "I'm a Teapot", description: "The server refuses the attempt to brew coffee with a teapot.", type: "Client Error" },
  { code: 421, name: "Misdirected Request", description: "The request was directed at a server that is unable to produce a response.", type: "Client Error" },
  { code: 422, name: "Unprocessable Entity", description: "The request was well-formed but was unable to be followed due to semantic errors.", type: "WebDAV" },
  { code: 423, name: "Locked", description: "The resource that is being accessed is locked.", type: "WebDAV" },
  { code: 424, name: "Failed Dependency", description: "The request failed due to failure of a previous request.", type: "WebDAV" },
  { code: 425, name: "Too Early", description: "Indicates that the server is unwilling to risk processing a request that might be replayed.", type: "Client Error" },
  { code: 426, name: "Upgrade Required", description: "The client should switch to a different protocol.", type: "Client Error" },
  { code: 428, name: "Precondition Required", description: "The origin server requires the request to be conditional.", type: "Client Error" },
  { code: 429, name: "Too Many Requests", description: "The user has sent too many requests in a given amount of time (rate limiting).", type: "Client Error" },
  { code: 431, name: "Request Header Fields Too Large", description: "The server is unwilling to process the request because either an individual header field, or all the header fields collectively, are too large.", type: "Client Error" },
  { code: 451, name: "Unavailable For Legal Reasons", description: "The server is denying access to the resource as a consequence of a legal demand.", type: "Client Error" },
  { code: 500, name: "Internal Server Error", description: "A generic error message, given when an unexpected condition was encountered.", type: "Server Error" },
  { code: 501, name: "Not Implemented", description: "The server either does not recognize the request method, or it lacks the ability to fulfil the request.", type: "Server Error" },
  { code: 502, name: "Bad Gateway", description: "The server was acting as a gateway or proxy and received an invalid response from the upstream server.", type: "Server Error" },
  { code: 503, name: "Service Unavailable", description: "The server cannot handle the request (because it is overloaded or down for maintenance).", type: "Server Error" },
  { code: 504, name: "Gateway Timeout", description: "The server was acting as a gateway or proxy and did not receive a timely response from the upstream server.", type: "Server Error" },
  { code: 505, name: "HTTP Version Not Supported", description: "The server does not support the HTTP protocol version used in the request.", type: "Server Error" },
  { code: 506, name: "Variant Also Negotiates", description: "Transparent content negotiation for the request results in a circular reference.", type: "Server Error" },
  { code: 507, name: "Insufficient Storage", description: "The server is unable to store the representation needed to complete the request.", type: "WebDAV" },
  { code: 508, name: "Loop Detected", description: "The server detected an infinite loop while processing the request.", type: "WebDAV" },
  { code: 510, name: "Not Extended", description: "Further extensions to the request are required for the server to fulfil it.", type: "Server Error" },
  { code: 511, name: "Network Authentication Required", description: "The client needs to authenticate to gain network access.", type: "Server Error" },
];

const TYPE_COLORS: Record<string, string> = {
  Informational: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  Success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  Redirection: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  "Client Error": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  "Server Error": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  WebDAV: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

export function HTTPStatusCodes() {
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<string>("All");

  const types = useMemo(() => ["All", ...Array.from(new Set(HTTP_CODES.map(c => c.type)))], []);
  const filtered = useMemo(() => {
    let codes = HTTP_CODES;
    if (activeType !== "All") codes = codes.filter(c => c.type === activeType);
    if (search) {
      const q = search.toLowerCase();
      codes = codes.filter(c => `${c.code}`.includes(q) || c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    }
    return codes;
  }, [search, activeType]);

  return (
    <div className="space-y-4">
      <div>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by code, name, or description..."
          className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {types.map(t => (
          <button key={t} onClick={() => setActiveType(t)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${activeType === t ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface"}`}>
            {t} {t !== "All" && `(${HTTP_CODES.filter(c => c.type === t).length})`}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        {filtered.map(c => (
          <div key={c.code} className="flex items-start gap-3 p-3 rounded-lg border border-surface-200 dark:border-dark-border bg-white dark:bg-dark-surface">
            <span className="text-lg font-bold font-mono text-surface-900 dark:text-dark-text min-w-[3rem]">{c.code}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-surface-900 dark:text-dark-text">{c.name}</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${TYPE_COLORS[c.type] || ""}`}>{c.type}</span>
              </div>
              <p className="text-xs text-surface-500 dark:text-dark-muted mt-0.5">{c.description}</p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-sm text-surface-400 dark:text-dark-muted py-8">No matching status codes</p>}
      </div>
    </div>
  );
}
