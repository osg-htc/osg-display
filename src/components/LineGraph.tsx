import React from "react";
import {
  AnalysisResult,
  GeneratedReports,
  generateReports,
  Timespan,
} from "../util/gracc";

import "chart.js/auto";
import { Line } from "react-chartjs-2";
import useSWR from "swr";
import { Box } from "@mui/material";

type Props = {
  fallback: GeneratedReports;
  jobs: boolean;
  cpuHours: boolean;
  timespan: Timespan;
  chartRef: React.ComponentProps<typeof Line>["ref"];
};

const LineGraph = (props: Props) => {
  const { data, isLoading, error } = useSWR(
    "generateReports",
    async () => await generateReports(),
    {
      fallbackData: props.fallback,
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

  const options = generateOptions(
    data[props.timespan],
    props.jobs,
    props.cpuHours
  );
  return (
    <Box bgcolor="white">
      <Line
        {...options}
        plugins={[chartBackgroundColorPlugin]}
        ref={props.chartRef}
      />
    </Box>
  );

  return <div>LineGraph</div>;
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
  data: AnalysisResult,
  jobs: boolean,
  cpuHours: boolean
): React.ComponentProps<typeof Line> {
  const datasets = [];

  if (jobs) {
    datasets.push({
      label: "Jobs",
      data: data.dataPoints.map((point) => point.nJobs),
    });
  }
  if (cpuHours) {
    datasets.push({
      label: "CPU Hours",
      data: data.dataPoints.map((point) => point.cpuHours),
    });
  }

  const yLabel =
    jobs && cpuHours ? "Jobs/CPU Hours" : jobs ? "Jobs" : "CPU Hours";

  return {
    data: {
      labels: data.dataPoints.map((point) =>
        formatDate(point.timestamp, "daily")
      ),
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
            text: yLabel,
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

export default LineGraph;
