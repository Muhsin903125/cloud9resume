import Head from "next/head";
import Link from "next/link";
import PublicLayout from "../components/PublicLayout";

export default function Terms() {
  return (
    <PublicLayout>
      <Head>
        <title>Terms & Conditions - Cloud9Profile</title>
      </Head>
      <div className="max-w-4xl mx-auto w-full px-6 py-16">
        <h1 className="text-4xl font-bold mb-8">Terms & Conditions</h1>
        <div className="prose prose-blue max-w-none text-gray-600">
          <p className="mb-4">
            Effective Date: {new Date().toLocaleDateString()}
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">
            1. Introduction
          </h2>
          <p>
            Welcome to Cloud9Profile. By accessing or using our website and
            services, you agree to be bound by these Terms and Conditions. If
            you do not agree, please do not use our services.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">
            2. User Accounts
          </h2>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>
              You must provide accurate and complete information when creating
              an account.
            </li>
            <li>
              You are responsible for maintaining the confidentiality of your
              account credentials.
            </li>
            <li>
              We reserve the right to suspend or terminate accounts that violate
              our policies.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">
            3. Subscription & Credits
          </h2>
          <p>
            Cloud9Profile offers Free and Paid subscription plans. Paid plans
            may grant you specific "Credits" for actions such as Resume
            Downloads or AI Generated Content. Credits are non-transferable and
            may expire based on your plan terms (e.g., monthly reset).
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">
            4. Refund Policy
          </h2>
          <p>
            Please refer to our separate{" "}
            <div className="inline-block">
              <Link href="/refund-policy" className="text-blue-600 underline">
                Refund Policy
              </Link>
            </div>
            . Generally, all purchases are final unless otherwise required by
            law or stated in the specific offer.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">
            5. Acceptable Use
          </h2>
          <p>
            You agree not to misuse our services, including but not limited to:
            scraping data, attempting to breach security, or using the service
            for illegal purposes.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">
            6. Limitation of Liability
          </h2>
          <p>
            Cloud9Profile is provided "as is". We make no warranties, expressed
            or implied, regarding the reliability or availability of the
            service. In no event shall we be liable for indirect or
            consequential damages.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">
            7. Changes to Terms
          </h2>
          <p>
            We may update these terms from time to time. Continued use of the
            service constitutes acceptance of the new terms.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">
            8. Contact
          </h2>
          <p>For any questions, contact us at support@cloud9profile.com.</p>
        </div>
      </div>
    </PublicLayout>
  );
}
