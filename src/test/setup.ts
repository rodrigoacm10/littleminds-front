import "@testing-library/jest-dom/vitest";

const originalRequest = global.Request;

global.Request = class extends originalRequest {
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    if (init && "signal" in init) {
      delete init.signal;
    }
    super(input, init);
  }
} as typeof Request;
