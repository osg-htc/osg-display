"use client";

import useSWR from "swr";
import { GeneratedReports, generateReports, reportSanityCheck } from "./gracc";

export function useGRACC(fallbackData: GeneratedReports) {
  const { data, isLoading, mutate } = useSWR(
    "generateReports",
    async () => generateReports(),
    {
      fallbackData,
      refreshInterval: 1000 * 60 * 3, // refresh every 3 minutes
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: true,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
      shouldRetryOnError: false,
    }
  );

  if (!reportSanityCheck(data)) {
    console.error(
      "Generated reports failed sanity check; falling back to static data"
    );
    mutate(fallbackData);
  }

  return { data, isLoading, mutate };
}
