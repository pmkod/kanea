import { Text } from "@react-email/components";
import { BaseMail, code, paragraph, title } from "./base-mail";

interface EmailVerification {
  otp: string;
}

export const EmailVerification = ({ otp }: EmailVerification) => (
  <BaseMail>
    <Text style={{ ...title, marginBottom: 20 }}>Checking your account</Text>

    <Text style={paragraph}>Your otp is</Text>

    <code style={code}>{otp}</code>
  </BaseMail>
);

export default EmailVerification;
