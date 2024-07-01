import { Body, Container, Font, Head, Hr, Html, Section, Text } from "@react-email/components";
import * as React from "react";
import Logo from "./logo";

interface BaseMail {
  children: React.ReactNode;
}

export const BaseMail = ({ children }: BaseMail) => (
  <Html>
    <Head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&display=swap"
        rel="stylesheet"
      />
    </Head>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Logo />
          <Hr style={hr} />

          {children}
          <Hr style={hr} />
          <Text style={footer}>Kanea Abidjan, Ivory coast &copy;{new Date().getFullYear()}</Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default BaseMail;

export const main = {
  backgroundColor: "#f3f4f6",
  fontFamily: 'Nunito Sans,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  paddingTop: "40px",
};

export const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 30px",
  marginBottom: "64px",
};

export const box = {
  padding: "0 30px",
};

export const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

export const title = {
  color: "#1d2424",

  fontSize: "18px",
  lineHeight: "24px",
  textAlign: "left" as const,
};

export const paragraph = {
  color: "#525f7f",
  fontSize: "14px",
  marginTop: "20px",
  marginBottom: "5px",
  textAlign: "left" as const,
};

export const code = {
  fontFamily: "monospace",
  fontWeight: "700",
  padding: "1px 4px",
  backgroundColor: "#dfe1e4",
  fontSize: "24px",
  borderRadius: "4px",
  color: "#3c4149",
};

export const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
};
