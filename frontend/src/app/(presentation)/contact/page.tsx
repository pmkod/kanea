import ContactForm from "@/components/forms/contact-form";
import { Metadata } from "next";
import PresentationPageTitle from "../_presentation-page-title";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send us a message",
};

const ContactPage = () => {
  return (
    <div>
      <PresentationPageTitle>Contact us</PresentationPageTitle>

      <div className="px-5 pt-6 max-w-lg mx-auto">
        <ContactForm />
      </div>
    </div>
  );
};

export default ContactPage;
