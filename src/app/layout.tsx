import type { Metadata } from "next";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import "./globals.css";
import { Box } from "@mui/material";

export const metadata: Metadata = {
  title: "OSG Display",
  description: "Displays current OSG stasitics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <Box display="flex">
          <Box sx={{ width: "100%" }}>{children}</Box>
          <Box p="20px">
            <Sidebar />
          </Box>
        </Box>
      </body>
    </html>
  );
}
