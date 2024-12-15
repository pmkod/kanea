import { baseV1ApiUrl } from "@/configs/";
import { sessionIdFieldName } from "@/constants/session-constants";
import ky, { HTTPError } from "ky";

export const httpClient = ky.create({
  prefixUrl: baseV1ApiUrl + "/v1",
  credentials: "same-origin",
  mode: "cors",
  hooks: {
    beforeRequest: [
      async (request, options) => {
        const sessionId = localStorage.getItem(sessionIdFieldName);
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
          (error as any).errors = (res as any).errors;
        }
        return error;
      },
    ],
  },
  // mode: ""
});
