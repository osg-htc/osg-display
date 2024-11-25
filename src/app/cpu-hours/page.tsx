import { getSSGReports } from "@/src/util/gracc";
import ChartContainer from "@/src/components/ChartContainer";

const CPUHoursPage = async () => {
  const reports = await getSSGReports();

  return (
    <ChartContainer
      fallback={reports}
      includeJobs={false}
      includeCpuHours={true}
      description="CPU Hours"
      saveName="cpuHours"
    />
  );
};

export default CPUHoursPage;
