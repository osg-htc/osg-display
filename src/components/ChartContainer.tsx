"use client";

import { Box, Button, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useRef, useState } from "react";
import { GeneratedReports, Timespan } from "../util/gracc";
import LineGraph from "./LineGraph";

type Props = {
  fallback: GeneratedReports;
  includeJobs: boolean;
  includeCpuHours: boolean;
  saveName: string;
  description: string;
};

const ChartContainer = ({
  fallback,
  includeJobs,
  includeCpuHours,
  saveName,
  description,
}: Props) => {
  // the timespan for the histogram
  const [timespan, setTimespan] = useState<Timespan>("yearly");
  // reference to the chart, used for save to disk
  const chartRef = useRef<any>(null);

  function handleSave() {
    if (!chartRef || !chartRef.current) return;

    const date = new Date().toISOString().split("T")[0];

    // create a link element to download, and click it
    const link = document.createElement("a");
    link.download = `${saveName}-${date}.png`;
    link.href = chartRef.current.toBase64Image("image/png", 1);
    link.click();
    link.remove();
  }

  return (
    <Box height="100%" bgcolor="white">
      <Box height="100%" p="15px" boxSizing="border-box">
        <Box display="flex" justifyContent="space-between">
          <ToggleButtonGroup
            color="primary"
            value={timespan}
            aria-label="Timespan Options"
          >
            <ToggleButton
              value="daily"
              aria-label="24 Hours"
              onClick={() => setTimespan("daily")}
            >
              24 Hours
            </ToggleButton>
            <ToggleButton
              value="monthly"
              aria-label="30 Days"
              onClick={() => {
                setTimespan("monthly");
              }}
            >
              30 Days
            </ToggleButton>
            <ToggleButton
              value="yearly"
              aria-label="12 Months"
              onClick={() => {
                setTimespan("yearly");
              }}
            >
              12 Months
            </ToggleButton>
          </ToggleButtonGroup>
          <Box>
            <Button variant="outlined" onClick={handleSave}>
              Save
            </Button>
          </Box>
        </Box>

        <LineGraph
          fallback={fallback}
          includeJobs={includeJobs}
          includeCpuHours={includeCpuHours}
          chartTitle={
            description +
            " / " +
            (timespan === "daily"
              ? "Hour"
              : timespan === "monthly"
              ? "Day"
              : "Month")
          }
          timespan={timespan}
          chartRef={chartRef}
        />
      </Box>
    </Box>
  );
};

export default ChartContainer;
