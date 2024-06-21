import { appName, companyEmail } from "@/constants/app-constants";
import { Metadata } from "next";
import Group from "../_group";
import Paragraph from "../_paragraph";
import PresentationPageTitle from "../_presentation-page-title";
import Title from "../_title";
import { ScrollToTop } from "@/components/others/scroll-to-top";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: appName + "'s privacy policy",
};

const PrivacyPolicyPage = () => {
  const lasteUpdateDate = "Febuary 19th, 2024";
  return (
    <div>
      <ScrollToTop />
      <PresentationPageTitle>Privacy policy</PresentationPageTitle>

      <div className="px-5 pt-10 max-w-4xl mx-auto">
        <div className="mb-10">Last Modified: {lasteUpdateDate}</div>
        <Group>
          <Paragraph>
            {appName} was built by Kodossou Kouassi. This page is used to inform
            visitors regarding my policies with the collection, use, and
            disclosure of Personal Information if anyone decided to use my
            Service. If you choose to use my Service, then you agree to the
            collection and use of information in relation to this policy. The
            Personal Information that I collect is used for providing and
            improving the Service. I will not use or share your information with
            anyone except as described in this Privacy Policy. The terms used in
            this Privacy Policy have the same meanings as in our Terms and
            Conditions, which are accessible on our website unless otherwise
            defined in this Privacy Policy.
          </Paragraph>
        </Group>

        <Group>
          <Title>Information we collect</Title>
          <Paragraph>
            We collect your name, email, country and ip address.
          </Paragraph>
        </Group>

        <Group>
          <Title>Use of your personal information</Title>
          <Paragraph>
            We use your email to contact you for confirmation or for promotional
            purposes.
          </Paragraph>
        </Group>

        <Group>
          <Title>Information Collection and Use</Title>
          <Paragraph>
            For a better experience, while using our Service, I may require you
            to provide us with certain personally identifiable information. The
            information that I request will be retained on your device and is
            not collected by me in any way.
          </Paragraph>
        </Group>
        <Group>
          <Title>Log Data</Title>
          <Paragraph>
            I want to inform you that whenever you use my Service, in a case of
            an error in the app I collect data and information (through
            third-party products) on your phone called Log Data. This Log Data
            may include information such as your device Internet Protocol (“IP”)
            address, device name, operating system version, the configuration of
            the app when utilizing my Service, the time and date of your use of
            the Service, and other statistics.
          </Paragraph>
        </Group>
        <Group>
          <Title>Cookies</Title>
          <Paragraph>
            Cookies are files with a small amount of data that are commonly used
            as anonymous unique identifiers. These are sent to your browser from
            the websites that you visit and are stored on your device's internal
            memory. This Service does not use these “cookies” explicitly.
            However, the app may use third-party code and libraries that use
            “cookies” to collect information and improve their services. You
            have the option to either accept or refuse these cookies and know
            when a cookie is being sent to your device. If you choose to refuse
            our cookies, you may not be able to use some portions of this
            Service.
          </Paragraph>
        </Group>
        <Group>
          <Title>Service Providers</Title>
          <Paragraph>
            If you choose to visit the website, your visit and any dispute over
            privacy is subject to this Policy and the website's terms of use. In
            addition to the foregoing, any disputes arising under this Policy
            shall be governed by the laws of Ivory Coast.
          </Paragraph>
        </Group>

        <Group>
          <Title>Security</Title>
          <Paragraph>
            I value your trust in providing us your Personal Information, thus
            we are striving to use commercially acceptable means of protecting
            it. But remember that no method of transmission over the internet,
            or method of electronic storage is 100% secure and reliable, and I
            cannot guarantee its absolute security.
          </Paragraph>
        </Group>

        <Group>
          <Title>Links to Other Sites</Title>
          <Paragraph>
            This Service may contain links to other sites. If you click on a
            third-party link, you will be directed to that site. Note that these
            external sites are not operated by me. Therefore, I strongly advise
            you to review the Privacy Policy of these websites. I have no
            control over and assume no responsibility for the content, privacy
            policies, or practices of any third-party sites or services.
          </Paragraph>
        </Group>

        <Group>
          <Title>Children’s Privacy</Title>
          <Paragraph>
            I do not knowingly collect personally identifiable information from
            children. I encourage all children to never submit any personally
            identifiable information through the Application and/or Services. I
            encourage parents and legal guardians to monitor their children's
            Internet usage and to help enforce this Policy by instructing their
            children never to provide personally identifiable information
            through the Application and/or Services without their permission. If
            you have reason to believe that a child has provided personally
            identifiable information to us through the Application and/or
            Services, please contact us. You must also be at least 16 years of
            age to consent to the processing of your personally identifiable
            information in your country (in some countries we may allow your
            parent or guardian to do so on your behalf).
          </Paragraph>
        </Group>

        <Group>
          <Title>Changes to This Privacy Policy</Title>
          <Paragraph>
            I may update our Privacy Policy from time to time. Thus, you are
            advised to review this page periodically for any changes. I will
            notify you of any changes by posting the new Privacy Policy on this
            page. This policy is effective as of {lasteUpdateDate}
          </Paragraph>
        </Group>

        <Group>
          <Title>Contact Us</Title>
          <Paragraph>
            If you have any questions or suggestions about my Privacy Policy, do
            not hesitate to contact me at {companyEmail}. This privacy policy
            page was created at privacypolicytemplate.net and modified/generated
            by App Privacy Policy Generator
          </Paragraph>
        </Group>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
