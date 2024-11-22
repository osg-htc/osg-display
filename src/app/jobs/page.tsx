import ChartContainer from "@/src/components/ChartContainer";
import { getSSGReports } from "@/src/util/gracc";
import React from "react";

const JobsPage = async () => {
  const reports = await getSSGReports();

  return (
    <ChartContainer
      fallback={reports}
      jobs={true}
      cpuHours={false}
      description="Job Count"
      saveName="jobCount"
    />
  );
};

export default JobsPage;
