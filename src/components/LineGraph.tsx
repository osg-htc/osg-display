import { Box } from "@mui/material";
import React from "react";
import useSWR from "swr";
import { formatDate } from "../util/format";
import {
  AnalysisResult,
  GeneratedReports,
  generateReports,
  Timespan,
} from "../util/gracc";

import { Line } from "react-chartjs-2";
import "chart.js/auto";

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
    <Box width="100%" height="90%">
      <Line {...options} ref={chartRef} />
    </Box>
  );
};

/**
 * Generates the options for the Chart.js Line graph.
 * @param data analysis result data
 * @param timespan the timespan for the histogram
 * @param includeJobs whether to include the jobs data
 * @param includeCpuHours whether to include the CPU hours data
 * @param chartTitle the title of the chart
 * @returns the options for the Line graph, to be passed to the Line React component
 */
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
      data: data.dataPoints.map((point) => Math.floor(point.cpuHours)),
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
      normalized: true,
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 0,
      },
      plugins: {
        legend: {
          display: false,
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

/**
 * A Chart.js plugin to set the background color of the canvas.
 */
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
