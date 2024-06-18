import { customAlphabet, nanoid } from "nanoid";
import { otpLength } from "../constants/otp-constants";

export const generateOtp = () => customAlphabet("23456789ABCDEFGHJKLMNPQRSTUVWXYZ")(otpLength);
