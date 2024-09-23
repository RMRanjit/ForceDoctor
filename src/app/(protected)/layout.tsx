import NavBar from "@/components/common/NavBar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dr.Force",
  description: "Very Elaborate Diagnostic Info",
};

export default function protectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-col min-h-screen ">
      <NavBar />
      <section className="flex-grow mt-20 px-10"> {children}</section>
    </main>
  );
}
