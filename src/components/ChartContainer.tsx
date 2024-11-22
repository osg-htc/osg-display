"use client";

import { Box, Button, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useRef, useState } from "react";
import { GeneratedReports, Timespan } from "../util/gracc";
import LineGraph from "./LineGraph";

type Props = {
  fallback: GeneratedReports;
  jobs: boolean;
  cpuHours: boolean;
  saveName: string;
  description: string;
};

const ChartContainer = ({
  fallback,
  jobs,
  cpuHours,
  saveName,
  description,
}: Props) => {
  // reference to the chart, used for saving
  const chartRef = useRef<any>(null);
  // the timespan for the histogram
  const [timespan, setTimespan] = useState<Timespan>("yearly");

  function handleSave() {
    if (!chartRef.current) return;

    // create a link element to download, and click it
    const date = new Date().toISOString().split("T")[0];

    const link = document.createElement("a");
    link.download = `${saveName}-${date}.png`;
    link.href = chartRef.current.toBase64Image("image/png", 1);
    link.click();
  }

  return (
    <Box p="10px" bgcolor="white">
      <Box display="flex" justifyContent="space-between">
        <ToggleButtonGroup
          color="primary"
          value={timespan}
          aria-label="Timespan Options"
        >
          <ToggleButton
            value="daily"
            aria-label="24 Hours"
            onClick={() => {
              setTimespan("daily");
            }}
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
        jobs={jobs}
        cpuHours={cpuHours}
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
  );
};

export default ChartContainer;
