import { emailVerificationTokenFieldName } from "@/constants/email-verification-constants";
import { httpClient } from "./http-client";
import { sessionIdFieldName } from "@/constants/session-constants";

// Signup
export const signupRequest = async (data: { email: string }) =>
  (await httpClient.post("auth/signup", { json: data }).json()) as {
    [emailVerificationTokenFieldName]: string;
  };

export const signupEmailVerificationRequest = async (data: {
  [emailVerificationTokenFieldName]: string;
  otp: string;
}) =>
  await httpClient
    .post("auth/signup/email-verification", {
      json: data,
    })
    .json();

export const completeSignupRequest = async (data: {
  displayName: string;
  userName: string;
  password: string;
  [emailVerificationTokenFieldName]: string;
}) =>
  (await httpClient.post("auth/signup/complete", { json: data }).json()) as {
    [sessionIdFieldName]: string;
  };

// Login
export const loginRequest = async (data: { email: string; password: string }) =>
  (await httpClient.post("auth/login", { json: data }).json()) as {
    [emailVerificationTokenFieldName]: string;
  };

export const sendNewOtpForloginRequest = async (data: {
  [emailVerificationTokenFieldName]: string;
}) =>
  (await httpClient.post("auth/login", { json: data }).json()) as {
    [emailVerificationTokenFieldName]: string;
  };

export const loginVerificationRequest = async (data: {
  otp: string;
  [emailVerificationTokenFieldName]: string;
}) =>
  (await httpClient
    .post("auth/login/email-verification", {
      json: data,
    })
    .json()) as {
    [sessionIdFieldName]: string;
  };

// Logout
export const logoutRequest = async () =>
  await httpClient.get("auth/logout").json();

// Password reset
export const passwordResetRequest = async (data: { email: string }) =>
  (await httpClient
    .post("auth/password-reset", {
      json: data,
    })
    .json()) as {
    [emailVerificationTokenFieldName]: string;
  };

export const passwordResetVerificationRequest = async (data: {
  otp: string;
  [emailVerificationTokenFieldName]: string;
}) =>
  await httpClient
    .post("auth/password-reset/email-verification", {
      json: data,
    })
    .then((res) => res.json() as any);

export const newPasswordRequest = async (data: {
  newPassword: string;
  [emailVerificationTokenFieldName]: string;
}) =>
  (await httpClient
    .post("auth/password-reset/new-password", {
      json: data,
    })
    .json()) as {
    [sessionIdFieldName]: string;
  };
