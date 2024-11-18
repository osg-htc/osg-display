import { Box } from "@mui/material";

type TimeData = {
  periodDescription: string;
  jobs: number;
  cpuHours: number;
};

const Sidebar = () => {
  const dataSlots: TimeData[] = [
    { periodDescription: "24 Hours", jobs: 0, cpuHours: 0 },
    { periodDescription: "30 Days", jobs: 0, cpuHours: 0 },
    { periodDescription: "12 Months", jobs: 0, cpuHours: 0 },
  ];

  return (
    <Box width="400px" height="600px" bgcolor="white">
      {dataSlots.map((data) => (
        <Box key={data.periodDescription} sx={{ textDecoration: "bold" }}>
          In the last {data.periodDescription}
        </Box>
      ))}
    </Box>
  );
};

export default Sidebar;
