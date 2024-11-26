import { Root } from "./graccResponse";

const endpoint = "https://gracc.opensciencegrid.org:443/q";

// the raw index contains more detailed time data
const rawIndex = "gracc.osg.raw";
// the summary index contains more aggregated data and is faster to query
const summaryIndex = "gracc.osg.summary";

/**
 * The timespan for the histogram.
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
  sumJobs: number;
  sumCpuHours: number;
  dataPoints: HistogramDataPont[];
};

/**
 * The daily, monthly, and yearly reports for CPU Hours and Job Count.
 */
export type GeneratedReports = {
  generatedAt: string;
  daily: AnalysisResult;
  monthly: AnalysisResult;
  yearly: AnalysisResult;
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
  offset: number,
  index: string
): Promise<AnalysisResult> {
  const startStr = start.toISOString();
  const endStr = end.toISOString();
  const offsetStr = `${offset}ms`;

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

  const res = await fetch(`${endpoint}/${index}/_search?pretty`, {
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
    sumJobs: buckets.reduce((acc, bucket) => acc + bucket.Njobs.value, 0),
    sumCpuHours: buckets.reduce(
      (acc, bucket) => acc + bucket.CoreHours.value || bucket.doc_count,
      0
    ),
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
  // -1 is used for the end date to ensure the next hour isn't counted
  // +1 is used for the start date to ensure the previous hour isn't counted

  date = date ?? new Date();

  // 1 day ago
  let offset = date.getTime() % (1000 * 60 * 60); // get the amount of milliseconds in the current hour
  let end = new Date(date.getTime() - offset - 1); // round to the nearest hour
  let start = new Date(end.getTime() - 1000 * 60 * 60 * 24 + 1); // subtract 1 day
  const daily = await graccQuery(start, end, "1h", 0, rawIndex);

  // 30 days ago
  offset = date.getTime() % (1000 * 60 * 60 * 24); // get the amount of milliseconds in the current day
  end = new Date(date.getTime() - offset - 1); // round to the nearest day
  start = new Date(end.getTime() - 1000 * 60 * 60 * 24 * 30 + 1); // subtract 30 days
  const monthly = await graccQuery(start, end, "1d", 0, summaryIndex);

  // 1 year ago
  start = new Date(date);
  start.setFullYear(date.getFullYear() - 1);
  start.setDate(1);
  end = new Date(date);
  console.log(start.toISOString());
  const yearly = await graccQuery(start, end, "month", 1000 * 60 * 60 * 24, summaryIndex);

  return {
    generatedAt: date.toISOString(),
    daily,
    monthly,
    yearly,
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
  if (ssgReport) {
    return ssgReport;
  }

  ssgReport = await generateReports();
  return ssgReport;
}
