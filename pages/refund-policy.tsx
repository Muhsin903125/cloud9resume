import Head from "next/head";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-white">
      <Head>
        <title>Refund & Payment Policy - Cloud9Profile</title>
      </Head>
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-16">
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
            We offer a 7-day money-back guarantee for first-time purchases of
            Pro or Pro+ plans if you are unsatisfied with the service. To
            request a refund, please contact support@cloud9profile.com within 7
            days of your transaction.
          </p>
          <p>Refunds are not available for:</p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>Renewal charges (if not canceled in time).</li>
            <li>
              One-time credit packs that have been partially or fully used.
            </li>
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
      </main>
      <Footer />
    </div>
  );
}
