import React from "react";
import {
  AnalysisResult,
  GeneratedReports,
  generateReports,
  Timespan,
} from "../util/gracc";

import { Box } from "@mui/material";
import "chart.js/auto";
import { Line } from "react-chartjs-2";
import useSWR from "swr";

type Props = {
  fallback: GeneratedReports;
  includeJobs: boolean;
  includeCpuHours: boolean;
  chartTitle: string;
  timespan: Timespan;
  chartRef: React.ComponentProps<typeof Line>["ref"];
};

const LineGraph = ({
  fallback,
  includeJobs,
  includeCpuHours,
  chartTitle,
  timespan,
  chartRef,
}: Props) => {
  const { data, isLoading } = useSWR(
    "generateReports",
    async () => await generateReports(),
    {
      fallbackData: fallback,
      refreshInterval: 1000 * 60 * 3, // refresh every 3 minutes
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

  if (!data) {
    return (
      <Box
        width="100%"
        height="100%"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <i>Failed to load data</i>
      </Box>
    );
  }

  const options = generateOptions(
    data[timespan],
    timespan,
    includeJobs,
    includeCpuHours,
    chartTitle
  );

  return (
    <Box bgcolor="white">
      <Line {...options} ref={chartRef} />
    </Box>
  );
};

function formatDate(date: Date, timespan: Timespan): string {
  switch (timespan) {
    case "daily":
      return date.toLocaleString("en-US", {
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      });
    case "monthly":
      return date.toLocaleString("en-US", {
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        year: "numeric",
      });
    case "yearly":
      return date.toLocaleString("en-US", {
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        year: "numeric",
      });
  }
}

function generateOptions(
  data: AnalysisResult,
  timespan: Timespan,
  includeJobs: boolean,
  includeCpuHours: boolean,
  chartTitle: string
): React.ComponentProps<typeof Line> {
  const fontSize = 18;
  const titleSize = 24;

  const labels = data.dataPoints.map((point) =>
    formatDate(new Date(point.timestamp), timespan)
  );

  const datasets = [];

  if (includeJobs) {
    datasets.push({
      label: "Jobs",
      data: data.dataPoints.map((point) => point.nJobs),
    });
  }

  if (includeCpuHours) {
    datasets.push({
      label: "CPU Hours",
      data: data.dataPoints.map((point) => point.cpuHours),
    });
  }

  const yLabel =
    includeJobs && includeCpuHours
      ? "Jobs and CPU Hours"
      : includeJobs
      ? "Jobs"
      : "CPU Hours";

  return {
    data: {
      labels,
      datasets,
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
        title: {
          display: true,
          text: chartTitle,
          align: "start",
          font: { size: titleSize },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Timestamp",
            font: { size: fontSize },
            padding: { top: 10, bottom: 10 },
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
            text: yLabel,
            font: { size: fontSize },
            padding: { top: 10, bottom: 10 },
          },
        },
      },
    },
    plugins: [chartBackgroundColorPlugin],
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

export default LineGraph;
