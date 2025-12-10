import { NextPage } from "next";
import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Button from "../../components/Button";
import Card from "../../components/Card";

const CreditsPage: NextPage = () => {
  const [creditStats] = useState({
    current: 75,
    used: 25,
    total: 100,
    resetDate: "2024-12-06",
  });

  const usage = [
    {
      action: "Resume Generated",
      credits: 5,
      date: "2024-11-06",
      time: "2:30 PM",
    },
    { action: "ATS Check", credits: 2, date: "2024-11-05", time: "4:15 PM" },
    {
      action: "Portfolio Created",
      credits: 10,
      date: "2024-11-04",
      time: "10:20 AM",
    },
    {
      action: "Resume Template",
      credits: 3,
      date: "2024-11-03",
      time: "1:45 PM",
    },
  ];

  const creditPacks = [
    {
      name: "Starter Pack",
      credits: 50,
      price: 9.99,
      popular: false,
    },
    {
      name: "Professional Pack",
      credits: 150,
      price: 24.99,
      popular: true,
      savings: "Save 17%",
    },
    {
      name: "Enterprise Pack",
      credits: 300,
      price: 49.99,
      popular: false,
      savings: "Save 25%",
    },
  ];

  return (
    <>
      <Head>
        <title>Credits - Cloud9 Resume</title>
        <meta
          name="description"
          content="Manage your credits and view usage history"
        />
      </Head>

      <div className="min-h-screen font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900 relative">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <h1 className="text-base font-semibold text-gray-900">Credits</h1>
            <div className="text-xs text-gray-500">
              Billing cycle resets on{" "}
              <span className="font-medium text-gray-900">
                {creditStats.resetDate}
              </span>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8 relative z-10">
          {/* Credit Overview */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="p-5 flex flex-col items-center justify-center border-blue-200 bg-blue-50/50">
              <div className="text-4xl font-bold text-blue-600 mb-1">
                {creditStats.current}
              </div>
              <p className="text-xs font-medium text-blue-900 uppercase tracking-wide">
                Available Credits
              </p>
            </Card>
            <Card className="p-5 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold text-gray-900 mb-1">
                {creditStats.used}
              </div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Used This Month
              </p>
            </Card>
            <Card className="p-5 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold text-gray-400 mb-1">
                {creditStats.total}
              </div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Monthly Limit
              </p>
            </Card>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Purchase Credits (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                Purchase Packs
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {creditPacks.map((pack, index) => (
                  <Card
                    key={index}
                    className={`p-5 transition-shadow hover:shadow-md ${
                      pack.popular
                        ? "ring-1 ring-blue-500 border-blue-500 relative overflow-hidden"
                        : ""
                    }`}
                  >
                    {pack.popular && (
                      <div className="absolute top-0 right-0 py-0.5 px-2 bg-blue-500 text-white text-[10px] font-bold uppercase rounded-bl-lg">
                        Best Value
                      </div>
                    )}
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <h3 className="text-base font-bold text-gray-900">
                          {pack.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                          {pack.credits} credits
                        </p>
                      </div>

                      <div className="flex items-end justify-between mt-2">
                        <div>
                          <p className="text-xl font-bold text-gray-900">
                            ${pack.price}
                          </p>
                          {pack.savings && (
                            <p className="text-xs text-green-600 font-medium">
                              {pack.savings}
                            </p>
                          )}
                        </div>
                        <Button
                          variant={pack.popular ? "primary" : "secondary"}
                          size="small"
                          className="text-xs"
                        >
                          Buy Now
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mt-8">
                Info
              </h2>
              <Card className="p-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <span className="text-2xl mb-2 block">📄</span>
                    <p className="font-semibold text-gray-900 text-sm">
                      Resume
                    </p>
                    <p className="text-xs text-gray-500">5 credits</p>
                  </div>
                  <div className="text-center">
                    <span className="text-2xl mb-2 block">🎯</span>
                    <p className="font-semibold text-gray-900 text-sm">
                      ATS Check
                    </p>
                    <p className="text-xs text-gray-500">2 credits</p>
                  </div>
                  <div className="text-center">
                    <span className="text-2xl mb-2 block">🎨</span>
                    <p className="font-semibold text-gray-900 text-sm">
                      Portfolio
                    </p>
                    <p className="text-xs text-gray-500">10 credits</p>
                  </div>
                  <div className="text-center">
                    <span className="text-2xl mb-2 block">📝</span>
                    <p className="font-semibold text-gray-900 text-sm">
                      Template
                    </p>
                    <p className="text-xs text-gray-500">3 credits</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Usage History (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                Recent Usage
              </h2>
              <Card className="overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {usage.map((item, index) => (
                    <div
                      key={index}
                      className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center"
                    >
                      <div>
                        <p className="text-xs font-medium text-gray-900">
                          {item.action}
                        </p>
                        <p className="text-[10px] text-gray-400">{item.date}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-red-500">
                          -{item.credits}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                  <button className="text-xs font-medium text-gray-600 hover:text-gray-900">
                    View All History
                  </button>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default CreditsPage;
