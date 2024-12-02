"use client";

import { GeneratedReports, generateReports } from "@/src/util/gracc";
import { Box } from "@mui/material";
import useSWR from "swr";
import style from "./InnerSidebar.module.css";
import { Fragment, useEffect, useState } from "react";
import { formatNumber } from "@/src/util/format";

type SidebarData = {
  title: string;
  sumJobs: string;
  sumCpuHours: string;
}[];

type Props = {
  fallbackData: GeneratedReports;
};

const InnerSidebar = ({ fallbackData }: Props) => {
  const { data, isLoading } = useSWR("generateReports", async () => generateReports(), {
    fallbackData,
    refreshInterval: 1000 * 60 * 3, // refresh every 3 minutes
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateOnMount: true,
  });

  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [tableElements, setTableElements] = useState<JSX.Element[]>([]);

  useEffect(() => {
    // this will work even if fallback data is used
    if (data) {
      setLastUpdated(new Date(data.generatedAt).toLocaleString("en-US"));
      setTableElements(generateTableElements(generateSidebarData(data)));
    }
  }, [data]);

  return (
    <Box
      className={style.container}
      width="300px"
      height="100%"
      bgcolor="white"
      mx="auto"
    >
      {isLoading ? (
        <></>
      ) : (
        <Box
          height="100%"
          display="flex"
          flexDirection="column"
          justifyContent="space-around"
        >
          <Box>{tableElements}</Box>
          <Box className={style.rowLabel} mt="auto">
            <span style={{ display: "block" }}>
              Last updated: <br /> {lastUpdated}
            </span>
          </Box>
        </Box>
      )}
    </Box>
  );
};

function generateTableElements(data: SidebarData) {
  return data.map((data) => (
    <Fragment key={`${data.title}-fragment`}>
      <Box key={data.title} className={style.rowLabel}>
        {/* description title */}
        {data.title}
      </Box>
      <Box key={`${data.title}-jobs`} className={style.rowContainer}>
        {/* number of jobs */}
        <span className={style.rowNumber}>{data.sumJobs}</span>
        <span> Jobs</span>
      </Box>
      <Box key={`${data.title}-cpu-hours`} className={style.rowContainer}>
        {/* number of cpu hours */}
        <span className={style.rowNumber}>{data.sumCpuHours}</span>
        <span> CPU Hours</span>
      </Box>
    </Fragment>
  ));
}

function generateSidebarData(reports: GeneratedReports): SidebarData {
  return [
    {
      title: "In the last 24 Hours",
      sumJobs: formatNumber(reports.dailySum.sumJobs),
      sumCpuHours: formatNumber(reports.dailySum.sumCpuHours),
    },
    {
      title: "In the last 30 Days",
      sumJobs: formatNumber(reports.monthlySum.sumJobs),
      sumCpuHours: formatNumber(reports.monthlySum.sumCpuHours),
    },
    {
      title: "In the last 12 Months",
      sumJobs: formatNumber(reports.yearlySum.sumJobs),
      sumCpuHours: formatNumber(reports.yearlySum.sumCpuHours),
    },
  ];
}

export default InnerSidebar;
