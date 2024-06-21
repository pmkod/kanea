import {
  appName,
  baseDomainName,
  companyEmail,
  privacyPolicyUrl,
} from "@/constants/app-constants";
import { Metadata } from "next";
import Group from "../_group";
import Paragraph from "../_paragraph";
import PresentationPageTitle from "../_presentation-page-title";
import Title from "../_title";
import { ScrollToTop } from "@/components/others/scroll-to-top";

export const metadata: Metadata = {
  title: "Terms",
  description: appName + "'s terms",
};

const TermsPage = () => {
  return (
    <div>
      <ScrollToTop />
      <PresentationPageTitle>Our terms</PresentationPageTitle>

      <div className="px-5 pt-10 max-w-4xl mx-auto">
        <div className="mb-10">Last Modified: Febuary 19th, 2024</div>
        <Group>
          <Title>Acceptance of the Terms of Use and Conditions</Title>
          <Paragraph>
            These terms of use are binding upon the User and
            {appName} . The following terms and conditions set the rules for the
            User’s access and use of {baseDomainName}, including any content and
            services offered through {baseDomainName}. Please read the Terms of
            Use and Conditions before using the Website.
          </Paragraph>
          <Paragraph>
            By using this Website you accept these Terms of Use and Conditions.
            If you do not want to agree to these Terms of Use and Conditions,
            you must leave the Website and refrain from having any access to it
            in the future.
          </Paragraph>
          <Paragraph>
            By using this Website, you represent and warrant that you are of
            legal age to consent to these Terms and Conditions. If you do not
            meet the legal age requirements to consent to these Terms and
            Conditions you must leave the Website and refrain from having any
            access to it in the future.
          </Paragraph>
        </Group>

        <Group>
          <Title>
            Changes to the Terms of Use and Conditions and to the Website
          </Title>
          <Paragraph>
            We may revise and update these Terms of Use and Conditions as
            necessary as possible and at our discretion. All changes are
            effective at the moment we post such changes and shall apply to all
            access and use of the Website.
          </Paragraph>
          <Paragraph>
            The User must verify these Terms of Use and Conditions from time to
            time. The User's continued access and use of the Website following a
            revision of the Terms of Use and Conditions shall imply an
            acceptance of the changes.
          </Paragraph>
          <Paragraph>
            The Company may change the content of this Website from time to
            time. However, this content is not necessarily complete or
            up-to-date and the Company is not under any obligation to update it.
          </Paragraph>
        </Group>

        <Group>
          <Title>Reliance on the Information Posted</Title>
          <Paragraph>
            The information presented on the Website is only available for
            information purposes. The Company does not warrant the accuracy or
            completeness of this information. The User may not place reliance on
            the information on the Website. The Company disclaims any liability
            that could arise if any user or any visitor to the Website relies on
            such materials.
          </Paragraph>
          <Paragraph>
            Third parties may provide content to this Website that includes or
            may include materials provided by other users, bloggers, and
            third-party licensors, syndicators or reporting services. The
            opinions and statements expressed in these materials are solely the
            responsibility of the person or entity providing those materials.
            These materials do not necessarily reflect the opinion or views of
            the Company.
          </Paragraph>
        </Group>

        <Group>
          <Title>Website Access</Title>
          <Paragraph>
            The Company reserves the right to amend, modify or delete this
            Website and its services at our discretion. The Company will not be
            liable if the Website is unavailable. The Company may restrict user
            access to some parts of the Website or the entire Website.
          </Paragraph>
          <Paragraph>
            The Company is not responsible if the User does not meet the
            requirements to access the Website. The information you provide to
            the Company must be up to date and complete. The User is responsible
            for informing all persons who use the User's internet connection
            about complying with the Website's Terms of Use and Conditions.
          </Paragraph>
          <Paragraph>
            The User agrees that all the information provided to the Company for
            registration purposes is subject to its Privacy Policy
            {privacyPolicyUrl}. The User consents to all actions the Company
            takes under our Privacy Policy. The User is responsible for treating
            the username and password chosen or given as confidential. The User
            acknowledges that the account is personal and agrees to keep its
            information private from any other person. The User acknowledges
            that third parties do not have a right to access this Website with
            the User's registered information.
          </Paragraph>
          <Paragraph>
            The User shall notify the Company immediately of any unauthorized
            access to or use of the User's registered information or any other
            sort of breach of security. The Company has the right to delete any
            registered information or delete any account if it considers that
            the User has violated any provision of these Terms of Use and
            Conditions.
          </Paragraph>
        </Group>

        <Group>
          <Title>Prohibitions</Title>
          <Paragraph>
            The User agrees not to use the Website in any way or form that
            violates any applicable federal, state, local, or international law.
            The User may not send, receive, upload, download, or otherwise
            transmit, or procure the sending of, any advertising or promotional
            material, including any junk mail, chain letter, spam, or any other
            similar solicitation, without the prior written consent of the
            Company.
          </Paragraph>
          <Paragraph>
            The User may not impersonate or attempt to impersonate the Company,
            a Company employee, another user, or any other person or entity when
            using the Website. The User may not engage in any other conduct that
            restricts or inhibits other users' use or enjoyment of the Website
            or that may harm the Company or users of the Website, or expose them
            to liability.
          </Paragraph>
          <Paragraph>
            Additionally, the User may not use the Website in any manner that
            could disable, overburden, damage, interfere, or impair other users'
            access to the Website or the proper working of the Website.
            Furthermore, the User may not use any bot, robot, spider, or any
            automatic device to access the Website for monitoring purposes.
          </Paragraph>
        </Group>

        <Group>
          <Title>User Content</Title>
          <Paragraph>
            The Website may contain forums, chat rooms, personal web pages or
            profiles, bulletin boards, and other interactive features that allow
            the users to post content or materials on the Website. Any User
            Content you post to the site will be considered non-confidential and
            non-proprietary. The User grants the Company and assigns the right
            to use, reproduce, modify, perform, display, distribute, and
            otherwise disclose to third parties any such material for any
            purpose.
          </Paragraph>
          <Paragraph>
            The User represents and warrants that the User has the right to
            distribute the content that the User posts or shares on the Website.
            The User also warrants that all such contents comply with these
            Terms of Use and Conditions. The Company is not responsible or
            liable to any third party for the contents posted on its Website.
          </Paragraph>
        </Group>

        <Group>
          <Title>Content Standards</Title>
          <Paragraph>
            These content standards apply to all content made by the User on the
            Website. These contents must comply with any applicable federal,
            state, local, and international laws and regulations.
          </Paragraph>
          <Paragraph>
            Content by the User must not contain images or texts that are
            offensive, defamatory, abusive, harassing, violent, hateful,
            inflammatory, obscene, or otherwise objectionable. The User must not
            contribute any sexually explicit, violent, sexually discriminatory,
            or racist content. Furthermore, the User must also not violate any
            privacy rights of other Users {privacyPolicyUrl} or any third party,
            nor promote or advocate in favor of any illegal activity. Lastly,
            the User must not infringe any patent, trademark, copyright, or
            other Intellectual Property.
          </Paragraph>
        </Group>

        <Group>
          <Title>User Information</Title>
          <Paragraph>
            All the information collected on this Website by the Company is
            subject to our Privacy Policy{" "}
            <span className="whitespace-nowrap">{privacyPolicyUrl}</span>. By
            using the Website, the User consents to any action the Company might
            take concerning the User’s information and its compliance with the
            Privacy Policy.
          </Paragraph>
          <Paragraph>
            The Company hereby incorporates any additional terms and conditions
            and by this reference and may also incorporate specific portions,
            services, or features of the Website.
          </Paragraph>
        </Group>

        <Group>
          <Title>Social Media and Links</Title>
          <Paragraph>
            The User may place a link to our homepage provided that it is done
            fairly and legally and does not damage our reputation. However, the
            User must not be associated with the Company and such linking does
            not constitute any form of approval or endorsement on the Company's
            part.
          </Paragraph>
          <Paragraph>
            This Website may provide certain social media features that enable
            you to link from your own or certain third-party websites to certain
            content on this Website. It may also send emails or other
            communications with certain content, or links to certain content, on
            this Website, and cause limited portions of content on this Website
            to be displayed or appear to be displayed on the User's own or
            certain third-party websites.
          </Paragraph>
          The User may use these features solely as they are provided by the
          Company. The User you must not take any action concerning the
          materials on this Website that is inconsistent with any other
          provision of these Terms of Use.
          <Paragraph>
            The User agrees to cooperate with us in immediately ceasing any
            unauthorized linking. The Company reserves the right to withdraw
            linking permission without notice and may disable all or any social
            media features at any time without any prior notice.
          </Paragraph>
        </Group>

        <Group>
          <Title>Intellectual Property Rights</Title>
          <Paragraph>
            The Company owns the Website and its entire contents, features, and
            functionality, including but not limited to, all information,
            software, apps, texts, displays, images, video, and audio, and the
            design are the intellectual property of the Company and its
            licensors. The Company's intellectual property is protected by
            domestic and international copyright, trademark, patent, trade
            secret, and other intellectual property laws.
          </Paragraph>
          <Paragraph>
            These Terms of Use permit the User to use the Website for personal
            use only. The User must not reproduce, distribute, modify, create
            derivative works of, publicly display, publicly perform, republish,
            download, store or transmit any of the material on our Website.
            However, the User may print or download pages from the Website for
            the User's personal use. The User may also download desktop or
            mobile applications solely for personal use, provided that the User
            agrees to be bound by any license agreement the company may offer
            for such applications.
          </Paragraph>
          <Paragraph>
            The User must not modify copies of any materials from this site, use
            any illustrations, photographs, video or audio sequences, or any
            graphics separately from the accompanying text. The User must not
            access or use for any commercial purposes any part of the Website or
            any services or materials available through the Website.
          </Paragraph>
          <Paragraph>
            If the User prints, copies, modifies, downloads, or otherwise uses
            or provides any other person with access to any part of the Website,
            it will be considered a breach of the Terms of Use and Conditions.
            In such circumstances, the User's right to use the Website will stop
            immediately and must return or destroy any copies of the materials
            made.
          </Paragraph>
        </Group>

        <Group>
          <Title>Trademarks</Title>
          <Paragraph>
            The Company name, its trademarks, and all related names, logos,
            product and service names, designs, and slogans are trademarks of
            the Company or its affiliates or licensors. The User must not use
            such marks without the prior written permission of the Company. All
            other names, logos, product and service names, designs, and slogans
            on this Website are the trademarks of their respective owners.
          </Paragraph>
        </Group>

        <Group>
          <Title>No warranties</Title>
          <Paragraph>
            This website is provided “as is” without any representations or
            warranties, express or implied. The Company makes no representations
            or warranties in relation to this website or the information and
            materials provided on this website.
          </Paragraph>
          <Paragraph>
            The Company does not warrant that this website will be constantly
            available, or available at all; or that the information on this
            website is complete, true, accurate, or non-misleading. Nothing on
            this website constitutes or is meant to constitute, advice of any
            kind. If you require advice in relation to any matter you should
            consult an appropriate professional.
          </Paragraph>
        </Group>

        <Group>
          <Title>Limitations of liability</Title>
          <Paragraph>
            The Company will not be liable to the User in relation to the
            contents of, or use of, or otherwise in connection with, this
            website for any indirect, special, or consequential loss; or for any
            business losses, loss of revenue, income, profits or anticipated
            savings, loss of contracts or business relationships, loss of
            reputation or goodwill, or loss or corruption of information or
            data.
          </Paragraph>
        </Group>

        <Group>
          <Title>Indemnification</Title>
          <Paragraph>
            You agree to defend, indemnify, and hold harmless the Company from
            and against any claims, liabilities, damages, judgments, awards,
            losses, costs, expenses, or fees (including reasonable attorneys'
            fees) arising out of or relating to your violation of these Terms of
            Use and Conditions or your use of the Website, including, but not
            limited to, your User Contents, any use of the Website's content,
            services, and products other than as expressly authorized in these
            Terms of Use and Conditions, or your use of any information obtained
            from the Website.
          </Paragraph>
        </Group>

        <Group>
          <Title>Governing Law</Title>
          <Paragraph>
            All matters relating to the Website and all issues that could
            potentially arise out of, or related to, these Terms of Use and
            Conditions, and any dispute or claim arising therefrom or related
            thereto (in each case, including non-contractual disputes or
            claims), shall be governed by and construed under the internal laws
            of the State of Ivory Coast without giving effect to any choice or
            conflict of law provision or rule (whether of the State of Ivory
            Coast or any other jurisdiction).
          </Paragraph>
          <Paragraph>
            The User waives any and all objections to the Company’s exercise of
            jurisdiction by such courts and venue in such courts.
          </Paragraph>
        </Group>

        <Group>
          <Title>Waiver and Severability</Title>
          <Paragraph>
            If any provision of this website disclaimer is or is found to be,
            unenforceable under applicable law, that will not affect the
            enforceability of the other provisions of this website disclaimer.
          </Paragraph>
        </Group>

        <Group>
          <Title>Entire Agreement</Title>
          <Paragraph>
            The Terms of Use and Conditions and other relevant policies
            incorporated herein by reference constitute the sole and entire
            agreement between the User and the Company regarding the Website and
            supersede all prior and contemporaneous understandings, agreements,
            representations, and warranties, of any kind, regarding the use of
            the Website.
          </Paragraph>
        </Group>

        <Group>
          <Title>Comments and Concerns</Title>
          <Paragraph>
            If you have any comments or questions about these Terms of Use and
            Conditions, please notify the Company at {companyEmail}.
          </Paragraph>
        </Group>
      </div>
    </div>
  );
};

export default TermsPage;
