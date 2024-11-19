import { Box } from "@mui/material";
import type { Metadata } from "next";
import Header from "../components/Header/Header";
import Sidebar, { TimeData } from "../components/Sidebar/Sidebar";
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
  // sample sidebar data for now, will be fetched by static site generation and client
  const sampleSidebarData: TimeData[] = [
    { periodDescription: "24 Hours", jobs: 5, cpuHours: 30.2 },
    { periodDescription: "30 Days", jobs: 5, cpuHours: 30.2 },
    { periodDescription: "12 Months", jobs: 5, cpuHours: 30.2 },
  ];

  return (
    <html lang="en">
      <body>
        <Header />
        <Box
          mt="10px"
          ml="10px"
          display="flex"
          height="85%"
          className={style.contentContainer}
        >
          <Box width="100%">{children}</Box>
          <Box p="20px">
            <Sidebar data={sampleSidebarData} />
          </Box>
        </Box>
      </body>
    </html>
  );
}
