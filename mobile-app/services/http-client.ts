import ky, { HTTPError } from "ky";
import { baseV1ApiUrl } from "@/configs";
import { sessionIdFieldName } from "@/constants/session-constants";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

export const httpClient = ky.create({
  prefixUrl: baseV1ApiUrl + "/v1",
  hooks: {
    beforeRequest: [
      async (request) => {
        const userAgent = await Constants.getWebViewUserAgentAsync();

        if (userAgent) {
          request.headers.set("User-Agent", userAgent);
        }

        const sessionId = SecureStore.getItem(sessionIdFieldName);
        if (sessionId) {
          request.headers.set("Authorization", "Session " + sessionId);
        }
      },
    ],
    beforeError: [
      async (error: HTTPError) => {
        const { response } = error;
        if (response) {
          const res = await response.json();
          (error as any).errors = res.errors;
        }

        return error;
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        if (request.url.endsWith("auth/logout") && response.ok) {
          await SecureStore.deleteItemAsync(sessionIdFieldName);
        }
      },
    ],
  },
});
