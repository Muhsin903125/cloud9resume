import Head from "next/head";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-white">
      <Head>
        <title>Privacy Policy - Cloud9Profile</title>
      </Head>
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-16">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-blue max-w-none text-gray-600">
          <p className="mb-4">
            Effective Date: {new Date().toLocaleDateString()}
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
            7. Contact
          </h2>
          <p>For privacy concerns, please contact privacy@cloud9profile.com.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
