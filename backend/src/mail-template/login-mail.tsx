import { Text } from "@react-email/components";
import { BaseMail, code, paragraph, title } from "./base-mail";

interface LoginMail {
  otp: string;
}

const LoginMail = ({ otp }: LoginMail) => {
  return (
    <BaseMail>
      <Text style={{ ...title, marginBottom: 20 }}>Verification for login</Text>
      <Text style={paragraph}>Your otp is </Text>
      <code style={code}>{otp}</code>
      <Text style={paragraph}>If you did not initiate this log-in, please change your password</Text>
    </BaseMail>
  );
};

export default LoginMail;
