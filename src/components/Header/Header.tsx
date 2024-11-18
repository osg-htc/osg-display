import Box from "@mui/material/Box";
import Image from "next/image";
import style from "./Header.module.css";
import SourceButtons from "./SourceButtons";

const Header = () => {
  return (
    <Box
      component="header"
      bgcolor="#ffffff"
      sx={{ borderBottom: "5px solid #ffa500" }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        paddingY="5px"
        paddingX="15px"
      >
        <Image
          src="/osg.png"
          width={315 * 0.6}
          height={70 * 0.6}
          alt="OSG Logo"
        />
        <SourceButtons />
        <span className={style.tagline}>
          A national, distributed computing partnership for data-intensive
          research
        </span>
      </Box>
    </Box>
  );
};

export default Header;
