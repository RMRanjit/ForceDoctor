import type { Metadata } from "next";
import { Inter, Poppins, Montserrat } from "next/font/google";
import Provider from "@/components/common/Provider";
import { ThemeProvider } from "@/components/common/ThemeProvider";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const appFont = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dr.Force",
  description: "Very Elaborate Diagnostic Info",
  icons: { icon: "/logo.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // added suppressHydrationWarning to elimiate the issue with the warning "Extra attributes from the server: class,style at html"
    <html lang="en" suppressHydrationWarning>
      <Provider>
        <body className={appFont.className} suppressHydrationWarning>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </Provider>
    </html>
  );
}
