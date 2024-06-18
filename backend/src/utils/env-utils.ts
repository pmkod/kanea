import { isEmpty } from "radash";

export const readEnvVar = (envVarName: any) => {
  const envValue = process.env[envVarName];
  if (isEmpty(envValue)) {
    console.log(envVarName + " is empty");

    throw Error("Empty value");
  }
  return envValue;
};
