import { NextRequest, NextResponse } from "next/server";
import { baseV1ApiUrl, webSocketServerUrl } from "./configs";
import {
  githubLink,
  icons8WebsiteLink,
  portfolioLink,
} from "./constants/app-constants";

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV !== "production";

  // base-uri 'self' ${icons8WebsiteLink} ${portfolioLink} ${githubLink};
  const cspHeader = `
      child-src 'none';
      connect-src 'self' ${baseV1ApiUrl} ${webSocketServerUrl};
      base-uri 'self';
      default-src 'self';
      fenced-frame-src 'none';
      font-src 'self';
      form-action 'none';
      frame-ancestors 'none';
      frame-src 'none';
      img-src 'self' ${baseV1ApiUrl} blob:;
      manifest-src 'self';
      media-src 'self' ${baseV1ApiUrl} blob:;
      object-src 'self';
      script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${
    isDev ? "'unsafe-eval'" : ""
  };
      style-src 'self' 'unsafe-inline';
      upgrade-insecure-requests;
      worker-src 'none';
  `;
  // Replace newline characters and spaces
  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, " ")
    .trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set(
    "Content-Security-Policy",
    contentSecurityPolicyHeaderValue
  );
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set(
    "Content-Security-Policy",
    contentSecurityPolicyHeaderValue
  );
  // response.headers.set("x-nonce", nonce);
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "same-origin");

  return response;
}
