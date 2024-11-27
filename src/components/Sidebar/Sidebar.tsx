import { getSSGReports } from "@/src/util/gracc";
import InnerSidebar from "./InnerSidebar";

const Sidebar = async () => {
  const fallbackData = await getSSGReports();

  return <InnerSidebar fallbackData={fallbackData} />;
};

export default Sidebar;
