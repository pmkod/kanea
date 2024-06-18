import { httpClient } from "./http-client";

export const contactRequest = async (data: {
  name: string;
  email: string;
  message: string;
}) => await httpClient.post("contact", { json: data });
