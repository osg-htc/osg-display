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

import { Chart } from "react-chartjs-2";
import "chart.js/auto";

const FONT_SIZE = 18;
const TITLE_FONT_SIZE = 24;

type Props = {
  fallback: GeneratedReports;
  includeJobs: boolean;
  includeCpuHours: boolean;
  chartTitle: string;
  timespan: Timespan;
  chartRef: React.ComponentProps<typeof Chart>["ref"];
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
    async () => generateReports(),
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
    <Box height="90%">
      <Chart {...options} ref={chartRef} />
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
): React.ComponentProps<typeof Chart> {
  const labels = data.dataPoints.map((point) =>
    formatDate(new Date(point.timestamp), timespan)
  );
  const datasets = [];

  if (data.dataPoints.length !== 0) {
    const lastPoint = data.dataPoints[data.dataPoints.length - 1];
    const lineDataPoints = data.dataPoints.slice(0, -1); // remove the last point

    if (includeJobs) {
      datasets.push({
        type: "line",
        label: "Jobs",
        data: lineDataPoints.map((point) => point.nJobs),
      });

      datasets.push({
        type: "scatter",
        label: "Jobs",
        pointBackgroundColor: "red",
        data: [
          {
            x: formatDate(new Date(lastPoint.timestamp), timespan),
            y: lastPoint.nJobs,
          },
        ],
      });
    }

    if (includeCpuHours) {
      datasets.push({
        label: "CPU Hours",
        data: lineDataPoints.map((point) => point.cpuHours),
      });

      datasets.push({
        type: "scatter",
        label: "CPU Hours",
        pointBackgroundColor: "red",
        data: [
          {
            x: formatDate(new Date(lastPoint.timestamp), timespan),
            y: lastPoint.cpuHours,
          },
        ],
      });
    }
  }

  const yLabel =
    includeJobs && includeCpuHours
      ? "Jobs and CPU Hours"
      : includeJobs
      ? "Jobs"
      : "CPU Hours";

  return {
    type: "line",
    data: {
      labels,
      datasets: datasets as any, // this is VERY bad practice, however the React Charts.js typings are not as specific as they should be
    },
    options: {
      // normalized: true,
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
          mode: "nearest",
          intersect: false,
          callbacks: {
            label(tooltipItem) {
              const datasetLabel = tooltipItem.dataset.label || "";
              const dataPoint = tooltipItem.raw as
                | string
                | number
                | { x: string; y: number };

              if (typeof dataPoint === "string") {
                // shouldn't be possible but easy case
                return `${datasetLabel}: ${dataPoint}`;
              } else if (typeof dataPoint === "number") {
                // y value of the line graph
                return `${datasetLabel}: ${Math.floor(dataPoint).toLocaleString(
                  "en-US"
                )}`;
              } else {
                // point of the scatter plot
                return `${datasetLabel}: ${dataPoint.y.toLocaleString(
                  "en-US"
                )}`;
              }
            },
            title(tooltipItems): string | void {
              if (tooltipItems.length === 0) return "";

              const item = tooltipItems[0];
              if (
                item.raw &&
                typeof item.raw === "object" &&
                "x" in item.raw &&
                typeof item.raw.x === "string"
              ) {
                return item.raw.x;
              } else {
                // returning void will use the default method
                return;
              }
            },
          },
        },
        title: {
          display: true,
          text: chartTitle,
          align: "start",
          font: { size: TITLE_FONT_SIZE },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Timestamp",
            font: { size: FONT_SIZE },
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
            font: { size: FONT_SIZE },
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
