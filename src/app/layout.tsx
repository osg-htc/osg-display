import { Box } from "@mui/material";
import type { Metadata } from "next";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import "./globals.css";
import style from "./layout.module.css";

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
        <Box
          display="flex"
          height="85%"
          className={style.contentContainer}
          boxSizing="border-box"
        >
          <Box width="100%" className={style.childContainer}>
            {children}
          </Box>
          <Box mt="10px">
            <Sidebar />
          </Box>
        </Box>
      </body>
    </html>
  );
}
