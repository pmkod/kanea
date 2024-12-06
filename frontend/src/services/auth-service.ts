import { emailVerificationTokenFieldName } from "@/constants/email-verification-constants";
import { httpClient } from "./http-client";
import { sessionIdFieldName } from "@/constants/session-constants";

interface CompleteSignupRequestBody {
  displayName: string;
  userName: string;
  password: string;
}

export const signupRequest = async (data: { email: string }) => {
  // localStorage.setItem(
  //   emailVerificationTokenFieldName,
  //   resBody[emailVerificationTokenFieldName]
  // );
  const resBody = (await httpClient
    .post("auth/signup", {
      json: data,
    })
    .json()) as { [emailVerificationTokenFieldName]: string };

  localStorage.setItem(
    emailVerificationTokenFieldName,
    resBody[emailVerificationTokenFieldName]
  );
  return;
};

export const signupEmailVerificationRequest = async (otp: string) =>
  await httpClient
    .post("auth/signup/email-verification", {
      json: {
        otp,
        [emailVerificationTokenFieldName]:
          localStorage.getItem(emailVerificationTokenFieldName) || "",
      },
    })
    .json();

export const completeSignupRequest = async (
  data: CompleteSignupRequestBody
) => {
  const resBody = (await httpClient
    .post("auth/signup/complete", {
      json: {
        ...data,
        [emailVerificationTokenFieldName]:
          localStorage.getItem(emailVerificationTokenFieldName) || "",
      },
    })
    .json()) as {
    [sessionIdFieldName]: string;
  };
  localStorage.removeItem(emailVerificationTokenFieldName);
  localStorage.setItem(sessionIdFieldName, resBody[sessionIdFieldName]);
};

interface LoginRequestBody {
  email: string;
  password: string;
}
export const loginRequest = async (data?: LoginRequestBody) => {
  const resBody = (await httpClient
    .post("auth/login", {
      json: data,
    })
    .json()) as { [emailVerificationTokenFieldName]: string };

  localStorage.setItem(
    emailVerificationTokenFieldName,
    resBody[emailVerificationTokenFieldName]
  );
  return;
};

export const sendNewOtpForloginRequest = async () => {
  const resBody = (await httpClient
    .post("auth/login", {
      json: {
        [emailVerificationTokenFieldName]:
          localStorage.getItem(emailVerificationTokenFieldName) || "",
      },
    })
    .json()) as { [emailVerificationTokenFieldName]: string };
  localStorage.setItem(
    emailVerificationTokenFieldName,
    resBody[emailVerificationTokenFieldName]
  );
};

export const loginVerificationRequest = async (otp: string) => {
  const resBody = (await httpClient
    .post("auth/login/email-verification", {
      json: {
        otp,
        [emailVerificationTokenFieldName]:
          localStorage.getItem(emailVerificationTokenFieldName) || "",
      },
    })
    .json()) as {
    [sessionIdFieldName]: string;
  };
  localStorage.removeItem(emailVerificationTokenFieldName);
  localStorage.setItem(sessionIdFieldName, resBody[sessionIdFieldName]);
};

export const passwordResetRequest = async (data: { email: string }) => {
  const resBody = (await httpClient
    .post("auth/password-reset", {
      json: data,
    })
    .json()) as {
    [emailVerificationTokenFieldName]: string;
  };
  localStorage.setItem(
    emailVerificationTokenFieldName,
    resBody[emailVerificationTokenFieldName]
  );
};

export const passwordResetVerificationRequest = async (otp: string) => {
  await httpClient
    .post("auth/password-reset/email-verification", {
      json: {
        otp,
        [emailVerificationTokenFieldName]:
          localStorage.getItem(emailVerificationTokenFieldName) || "",
      },
    })
    .json();
};

export const newPasswordRequest = async (data: { newPassword: string }) => {
  const resBody = (await httpClient
    .post("auth/password-reset/new-password", {
      json: {
        ...data,
        [emailVerificationTokenFieldName]:
          localStorage.getItem(emailVerificationTokenFieldName) || "",
      },
    })
    .json()) as {
    [sessionIdFieldName]: string;
  };
  localStorage.removeItem(emailVerificationTokenFieldName);
  localStorage.setItem(sessionIdFieldName, resBody[sessionIdFieldName]);
};

export const logoutRequest = async () => {
  await httpClient.get("auth/logout").then((res) => res.json());
  localStorage.removeItem(sessionIdFieldName);
};
