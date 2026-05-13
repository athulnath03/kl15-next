import "../styles/globals.css";
import { Baloo_2 } from "next/font/google";

const baloo = Baloo_2({
  subsets: ["latin"],
});

export const metadata = {
  title: "KL15",
  description: "Routes. Depots. Timings.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={baloo.className}>
        {children}
      </body>
    </html>
  );
}
