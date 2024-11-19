import { Box } from "@mui/material";
import style from "./Sidebar.module.css";

export type TimeData = {
  periodDescription: string;
  jobs: number;
  cpuHours: number;
};

type Props = {
  data: TimeData[];
};

const Sidebar = ({ data }: Props) => {
  return (
    <Box width="300px" bgcolor="white" borderRadius="15px" mx="auto">
      {data.map((dataElement, i) => (
        <>
          <Box
            key={dataElement.periodDescription}
            className={style.rowLabel}
            sx={{
              // fix border radius for first element
              borderTopLeftRadius: i == 0 ? "15px" : "",
              borderTopRightRadius: i == 0 ? "15px" : "",
            }}
          >
            In the last {dataElement.periodDescription}
          </Box>

          <Box
            key={dataElement.periodDescription + "jobs"}
            className={style.rowContainer}
          >
            <span className={style.rowNumber}>{dataElement.jobs}</span>
            <span> Jobs</span>
          </Box>
          <Box
            key={dataElement.periodDescription + "cpuhours"}
            className={style.rowContainer}
          >
            <span className={style.rowNumber}>{dataElement.cpuHours}</span>
            <span> CPU Hours</span>
          </Box>
        </>
      ))}
    </Box>
  );
};

export default Sidebar;
