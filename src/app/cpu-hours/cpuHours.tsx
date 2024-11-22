"use client";

import { GeneratedReports, Timespan } from "@/src/util/gracc";
import { Box, Button, ButtonGroup } from "@mui/material";
import { useRef, useState } from "react";
import LineGraph from "@/src/components/LineGraph";

type Props = {
  fallback: GeneratedReports;
};

const CPUHours = ({ fallback }: Props) => {
  const chartRef = useRef<any>(null);
  const [timespan, setTimespan] = useState<Timespan>("yearly");

  function handleSave() {
    if (!chartRef.current) return;

    const date = new Date().toISOString().split("T")[0];

    const link = document.createElement("a");
    link.download = `cpuHours-${date}.png`;
    link.href = chartRef.current.toBase64Image("image/png", 1);
    link.click();
  }

  return (
    <Box maxHeight="100%" p="10px" bgcolor="white">
      <Box display="flex" justifyContent="space-between">
        <ButtonGroup variant="outlined" aria-label="Data buttons">
          <Button
            onClick={() => {
              setTimespan("daily");
            }}
          >
            24 Hours
          </Button>
          <Button
            onClick={() => {
              setTimespan("monthly");
            }}
          >
            30 Days
          </Button>
          <Button
            onClick={() => {
              setTimespan("yearly");
            }}
          >
            12 Months
          </Button>
        </ButtonGroup>
        <Box>
          <Button variant="outlined" onClick={handleSave}>
            Save
          </Button>
        </Box>
      </Box>

      <LineGraph
        fallback={fallback}
        jobs={true}
        cpuHours={false}
        timespan={timespan}
        chartRef={chartRef}
      />
    </Box>
  );
};

export default CPUHours;
