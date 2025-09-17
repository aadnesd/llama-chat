// Polyfills for Jest environment
if (typeof globalThis.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  globalThis.TextEncoder = TextEncoder;
  globalThis.TextDecoder = TextDecoder;
}

// Mock ReadableStream for Node.js environment
if (typeof globalThis.ReadableStream === 'undefined') {
  globalThis.ReadableStream = class ReadableStream {
    constructor(underlyingSource) {
      this.underlyingSource = underlyingSource;
    }
    
    getReader() {
      return {
        read: () => Promise.resolve({ done: true, value: undefined }),
      };
    }
  };
}

// Mock Request and Response for Next.js API routes
if (typeof globalThis.Headers === 'undefined') {
  globalThis.Headers = class Headers {
    constructor(init) {
      this._headers = new Map();
      if (init) {
        for (const [key, value] of Object.entries(init)) {
          this._headers.set(key.toLowerCase(), value);
        }
      }
    }

    get(name) {
      return this._headers.get(name.toLowerCase());
    }

    set(name, value) {
      this._headers.set(name.toLowerCase(), value);
    }
  };
}

if (typeof globalThis.Request === 'undefined') {
  globalThis.Request = class Request {
    constructor(input, init) {
      this.url = input;
      this.method = init?.method || 'GET';
      this.headers = new globalThis.Headers(init?.headers);
      this._body = init?.body;
    }
    
    json() {
      return Promise.resolve(JSON.parse(this._body || '{}'));
    }
  };
}

if (typeof globalThis.Response === 'undefined') {
  globalThis.Response = class Response {
    constructor(body, init) {
      this.body = body;
      this.status = init?.status || 200;
      this.headers = new globalThis.Headers(init?.headers);
    }
    
    json() {
      return Promise.resolve(JSON.parse(this.body || '{}'));
    }
  };
}