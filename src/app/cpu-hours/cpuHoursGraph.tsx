"use client";

import {
  AnalysisResult,
  GeneratedReports,
  generateReports,
  Timespan,
} from "@/src/util/gracc";
import { Box } from "@mui/material";
import useSWR from "swr";

import "chart.js/auto";
import { Line } from "react-chartjs-2";
import { ForwardedRef } from "react";

type Props = {
  fallback: GeneratedReports;
  timespan: Timespan;
  chartRef: React.ComponentProps<typeof Line>["ref"];
};

const CPUHoursGraph = ({ fallback, timespan, chartRef }: Props) => {
  const { data, isLoading, error } = useSWR(
    "generateReports",
    async () => await generateReports(),
    {
      fallbackData: fallback,
      refreshInterval: 1000 * 60 * 5,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: true,
    }
  );

  if (isLoading) {
    return (
      <Box
        width="100%"
        height="100%"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <i>Loading...</i>
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box
        width="100%"
        height="100%"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        Error
      </Box>
    );
  }

  const options = generateOptions(data[timespan]);
  return (
    <Box bgcolor="white">
      <Line
        {...options}
        plugins={[chartBackgroundColorPlugin]}
        ref={chartRef}
      />
    </Box>
  );
};

function formatDate(date: string, timespan: Timespan): string {
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: timespan === "daily" ? undefined : "numeric",
    hour: timespan === "daily" ? "numeric" : undefined,
    minute: timespan === "daily" ? "numeric" : undefined,
  });
}

function generateOptions(
  data: AnalysisResult
): React.ComponentProps<typeof Line> {
  return {
    data: {
      labels: data.dataPoints.map((point) =>
        formatDate(point.timestamp, "daily")
      ),
      datasets: [
        {
          label: "CPU Hours",
          data: data.dataPoints.map((point) => point.cpuHours),
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          mode: "index",
          intersect: false,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Timestamp",
          },
          ticks: {
            autoSkip: true,
            maxTicksLimit: 12,
          },
        },
        y: {
          min: 0,
          title: {
            display: true,
            text: "CPU Hours",
          },
        },
      },
    },
  };
}

const chartBackgroundColorPlugin = {
  id: "customCanvasBackgroundColor",
  beforeDraw: (chart: any, _: any, options: any) => {
    const { ctx } = chart;
    ctx.save();
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = options.color || "white";
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  },
};

export default CPUHoursGraph;
