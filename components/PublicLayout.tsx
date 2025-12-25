import React from "react";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-white">
      <main className="flex-1">{children}</main>
    </div>
  );
}
