import { Text } from "@react-email/components";
import { BaseMail, code, paragraph, title } from "./base-mail";

interface PasswordResetMail {
  otp: string;
}

const PasswordResetMail = ({ otp }: PasswordResetMail) => {
  return (
    <BaseMail>
      <Text style={{ ...title, marginBottom: 20 }}>Resetting your password</Text>
      <Text style={paragraph}>Your otp is </Text>
      <code style={code}>{otp}</code>
    </BaseMail>
  );
};

export default PasswordResetMail;
