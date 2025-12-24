import Head from "next/head";
import PublicLayout from "../components/PublicLayout";

export default function RefundPolicy() {
  return (
    <PublicLayout>
      <Head>
        <title>Refund & Payment Policy - Cloud9Profile</title>
      </Head>
      <div className="max-w-4xl mx-auto w-full px-6 py-16">
        <h1 className="text-4xl font-bold mb-8">Refund & Payment Policy</h1>
        <div className="prose prose-blue max-w-none text-gray-600">
          <p className="mb-4">
            Effective Date: {new Date().toLocaleDateString()}
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">
            1. Subscriptions
          </h2>
          <p>
            Cloud9Profile offers subscription plans billed on a monthly or
            yearly basis. Payment is collected in advance. Your subscription
            will automatically renew unless canceled at least 24 hours before
            the end of the current billing period.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">
            2. Cancellation
          </h2>
          <p>
            You may cancel your subscription at any time via your Account
            Dashboard. Upon cancellation, your access to premium features will
            continue until the end of your current paid period. We do not
            provide partial refunds for unused time.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">
            3. Refund Requests
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
            4. Currency
          </h2>
          <p>
            All transactions are processed in USD unless otherwise displayed at
            checkout.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">
            5. Chargebacks
          </h2>
          <p>
            If you initiate a chargeback with your bank, your account may be
            immediately suspended. We suggest contacting support first to
            resolve any billing issues.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
