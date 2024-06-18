"use client";
import Link from "next/link";

const TermsAndPrivacyPolicyTextInfo = () => {
  return (
    <div className="text-sm text-gray-700">
      By registering you accept the&nbsp;
      <Link href="terms" className="text-blue-500">
        Terms of use
      </Link>
      &nbsp;and the
      <Link href="/privacy-policy" className="text-blue-500 px-0">
        &nbsp;Privacy policy
      </Link>
    </div>
  );
};

export default TermsAndPrivacyPolicyTextInfo;
