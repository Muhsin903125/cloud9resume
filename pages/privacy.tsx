import Head from "next/head";
import PublicLayout from "../components/PublicLayout";

export default function Privacy() {
  return (
    <PublicLayout>
      <Head>
        <title>Privacy Policy - Cloud9Profile</title>
      </Head>
      <div className="max-w-4xl mx-auto w-full px-6 py-16  mt-16">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-blue max-w-none text-gray-600">
          <p className="mb-4 text-xs font-semibold">
            Effective Date: 01-JAN-2026
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">
            1. Information We Collect
          </h2>
          <p>
            We collect information you provide directly to us, such as when you
            create an account, build a resume, or contact support. This
            includes:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>Name, email address, and profile picture.</li>
            <li>Resume content (work history, education, skills, etc.).</li>
            <li>
              Payment information (processed securely by third-party providers
              like Stripe).
            </li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">
            2. How We Use Information
          </h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>Provide and maintain the Cloud9Profile service.</li>
            <li>Process transactions and manage your subscription.</li>
            <li>
              Generate PDF documents and hosted portfolios at your request.
            </li>
            <li>Analyze usage to improve our platform.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">
            3. Data Sharing
          </h2>
          <p>
            We do not sell your personal data. We verify that specific third
            parties (like hosting providers or payment processors) strictly
            adhere to data protection standards.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">
            4. Your Rights
          </h2>
          <p>
            You have the right to access, correct, or delete your personal data.
            You can delete your account via the Dashboard or contact support for
            assistance.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">
            5. Cookies
          </h2>
          <p>
            We use cookies to maintain your login session and analyze site
            traffic (e.g., Google Analytics). You can control cookies through
            your browser settings.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">
            6. Security
          </h2>
          <p>
            We implement industry-standard security measures to protect your
            data. However, no method of transmission over the Internet is 100%
            secure.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">
            8. Subscriptions
          </h2>
          <p>
            Cloud9Profile offers subscription plans billed on a monthly or
            yearly basis. Payment is collected in advance. Your subscription
            will automatically renew unless canceled at least 24 hours before
            the end of the current billing period.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">
            9. Cancellation
          </h2>
          <p>
            You may cancel your subscription at any time via your Account
            Dashboard. Upon cancellation, your access to premium features will
            continue until the end of your current paid period. We do not
            provide partial refunds for unused time.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">
            10. Refund Requests
          </h2>
          <p>
            We offer refunds only if the associated credits or features have not
            been used, and if the refund request is submitted within 12 hours of
            the transaction. To request a refund, please contact
            support@cloud9profile.com. Approved refunds will be processed within
            5-7 business days. Tax and service charges will be deducted from the
            refund amount.
          </p>
          <p>Refunds are not available for:</p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>Auto-renewed subscription charges.</li>
            <li>
              Any purchases where credits or features have already been
              utilized.
            </li>
            <li>Requests made after 12 hours from the time of transaction.</li>
            <li>Accounts suspended for violation of Terms of Service.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">
            11. Currency
          </h2>
          <p>
            All transactions are processed in USD unless otherwise displayed at
            checkout.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">
            12. Chargebacks
          </h2>
          <p>
            If you initiate a chargeback with your bank, your account may be
            immediately suspended. We suggest contacting support first to
            resolve any billing issues.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">
            13. Contact
          </h2>
          <p>
            For privacy or billing concerns, please contact
            support@cloud9profile.com.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
