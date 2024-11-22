import { getSSGReports } from "@/src/util/gracc";
import CPUHours from "./cpuHours";

const Page = async () => {
  const reports = await getSSGReports();

  return <CPUHours fallback={reports} />;
};

export default Page;
