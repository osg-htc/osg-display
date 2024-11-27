import { Root } from "./graccResponse";

const endpoint = "https://gracc.opensciencegrid.org:443/q";

// the raw index contains more detailed time data
const rawIndex = "gracc.osg.raw";
// the summary index contains more aggregated data and is faster to query
const summaryIndex = "gracc.osg.summary";

/**
 * The *entire* timespan for the histogram.
 */
export type Timespan = "daily" | "monthly" | "yearly";

/**
 * A data point in the histogram.
 */
export type HistogramDataPont = {
  timestamp: string;
  nJobs: number;
  cpuHours: number;
};

/**
 * The result of the analysis, including summary statistics and the histogram.
 */
export type AnalysisResult = {
  took: number;
  startTime: string;
  endTime: string;
  dataPoints: HistogramDataPont[];
};

export type SumResult = {
  sumJobs: number;
  sumCpuHours: number;
};

/**
 * The daily, monthly, and yearly reports for CPU Hours and Job Count.
 */
export type GeneratedReports = {
  generatedAt: string;
  daily: AnalysisResult;
  dailySum: SumResult;
  monthly: AnalysisResult;
  monthlySum: SumResult;
  yearly: AnalysisResult;
  yearlySum: SumResult;
};

/**
 * Queries the GRACC Elasticsearch endpoint for CPU Hours and Job Count to
 * create a histogram as well as summary statistics.
 *
 * @param start the start date for the query
 * @param end the end date for the query
 * @param interval the interval for the histogram
 * @param offset the offset for the histogram in ms. Does not assume the sign.
 * @param index the index to query. The raw index (`gracc.osg.raw`) is used for
 *        more detailed time data, while the summary index (`gracc.osg.summary`)
 *        is used for more broader data
 * @returns the analysis result
 */
async function graccQuery(
  start: Date,
  end: Date,
  interval: string,
  offset: number | string,
  index: string
): Promise<AnalysisResult> {
  const startStr = start.toISOString();
  const endStr = end.toISOString();
  const offsetStr = typeof offset === "number" ? `${offset}ms` : offset;

  // perform query

  const query = {
    size: 0,
    query: {
      bool: {
        filter: [
          {
            range: {
              EndTime: {
                gte: startStr,
                lt: endStr,
              },
            },
          },
          {
            term: {
              ResourceType: "Batch",
            },
          },
          {
            bool: {
              must_not: [
                {
                  terms: {
                    SiteName: ["NONE", "Generic", "Obsolete"],
                  },
                },
                {
                  terms: {
                    VOName: ["Unknown", "unknown", "other"],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    aggs: {
      EndTime: {
        date_histogram: {
          field: "EndTime",
          interval: interval,
          offset: offsetStr,
          extended_bounds: {
            min: startStr,
            max: endStr,
          },
        },
        aggs: {
          CoreHours: {
            sum: {
              field: "CoreHours",
            },
          },
          Njobs: {
            sum: {
              field: "Njobs",
            },
          },
        },
      },
    },
  };

  const res = await fetch(`${endpoint}/${index}/_search`, {
    method: "POST",
    body: JSON.stringify(query),
    headers: [["Content-Type", "application/json"]],
  });

  if (!res.ok) {
    throw new Error(`Failed to query GRACC: ${res.statusText}`);
  }

  // body response is in form of Root
  // note: if you change the query, you must remake response.d.ts
  // because the type declarations are manually generated from the response

  const body = (await res.json()) as Root;

  // craft result

  const buckets = body.aggregations.EndTime.buckets;
  const result = {
    took: body.took,
    startTime: startStr,
    endTime: endStr,
    dataPoints: buckets.map((bucket) => ({
      timestamp: bucket.key_as_string,
      nJobs: bucket.Njobs.value,
      cpuHours: bucket.CoreHours.value,
    })),
  };

  return result;
}

/**
 * Generates the daily, monthly, and yearly reports for CPU Hours and Job Count.
 * @param date the end date for the reports. Defaults to the current date.
 * @returns the generated reports
 */
export async function generateReports(date?: Date): Promise<GeneratedReports> {
  date = date ?? new Date();

  // only the start needs to be correctly aligned since we're also reporting
  // the current interval in a scatter plot

  const end = new Date(date);

  // 1 day ago
  let ms = date.getTime() % (1000 * 60 * 60); // get the amount of milliseconds in the current hour
  let start = new Date(date.getTime() - ms - 1000 * 60 * 60 * 24); // subtract 1 day
  const daily = await graccQuery(start, end, "1h", 0, rawIndex);

  const dailySum = daily.dataPoints.slice(-24-1, -1).reduce(
    (acc, point) => {
      acc.sumJobs += point.nJobs;
      acc.sumCpuHours += point.cpuHours;
      return acc;
    },
    { sumJobs: 0, sumCpuHours: 0 }
  );

  // 30 days ago
  ms = date.getTime() % (1000 * 60 * 60 * 24); // get the amount of milliseconds in the current day
  start = new Date(date.getTime() - ms - 1000 * 60 * 60 * 24 * 30); // subtract 30 days
  const monthly = await graccQuery(start, end, "24h", 0, summaryIndex);

  const monthlySum = monthly.dataPoints.slice(-30-1, -1).reduce(
    (acc, point) => {
      acc.sumJobs += point.nJobs;
      acc.sumCpuHours += point.cpuHours;
      return acc;
    },
    { sumJobs: 0, sumCpuHours: 0 }
  );

  // 1 year ago
  start = new Date(date);
  start.setFullYear(date.getFullYear() - 1);
  start.setDate(1);
  const yearly = await graccQuery(start, end, "month", 0, summaryIndex);

  const yearlySum = yearly.dataPoints.slice(-12-1, -1).reduce(
    (acc, point) => {
      acc.sumJobs += point.nJobs;
      acc.sumCpuHours += point.cpuHours;
      return acc;
    },
    { sumJobs: 0, sumCpuHours: 0 }
  );

  return {
    generatedAt: date.toISOString(),
    daily,
    dailySum,
    monthly,
    monthlySum,
    yearly,
    yearlySum,
  };
}

let ssgReport: GeneratedReports | null = null;

/**
 * Get the reports for CPU Hours and Job Count while building the site statically.
 * Saves the reports in memory to avoid regenerating them on every request
 * (which, realistically, would only be a few pages).
 *
 * @returns the generated reports
 */
export async function getSSGReports(): Promise<GeneratedReports> {
  if (!ssgReport) {
    ssgReport = await generateReports();
  }

  // sanity check that sums are at least 0
  if (
    (ssgReport.dailySum.sumCpuHours &&
      ssgReport.monthlySum.sumCpuHours &&
      ssgReport.yearlySum.sumCpuHours &&
      ssgReport.dailySum.sumJobs &&
      ssgReport.monthlySum.sumJobs &&
      ssgReport.yearlySum.sumJobs) === 0
  ) {
    console.error(ssgReport.dailySum);
    throw new Error("Generated reports are empty");
  }

  return ssgReport;
}
