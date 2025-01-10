import { NextRequest, NextResponse } from "next/server";
import { analyticsUrl, baseV1ApiUrl, webSocketServerUrl } from "./configs";
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
      connect-src 'self' ${baseV1ApiUrl} ${webSocketServerUrl} ${analyticsUrl};
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
      worker-src 'none';
      ${isDev ? "" : "upgrade-insecure-requests;"}
      `;
      

	// Replace newline characters and spaces
	const contentSecurityPolicyHeaderValue = cspHeader
  .replace(/\s{2,}/g, " ")
  .trim();

const requestHeaders = new Headers(request.headers);
requestHeaders.set("x-nonce", nonce);

requestHeaders.set(
  "Content-Security-Policy",
  contentSecurityPolicyHeaderValue,
);

const response = NextResponse.next({
  request: {
    headers: requestHeaders,
  },
});
response.headers.set(
  "Content-Security-Policy",
  contentSecurityPolicyHeaderValue,
);

  return response;
}


export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		{
			source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
			missing: [
				{ type: "header", key: "next-router-prefetch" },
				{ type: "header", key: "purpose", value: "prefetch" },
			],
		},
	],
};
