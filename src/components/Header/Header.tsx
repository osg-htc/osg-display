import Box from "@mui/material/Box";
import Image from "next/image";
import style from "./Header.module.css";
import { Button, ButtonGroup, Link } from "@mui/material";

const Header = () => {
  return (
    <Box
      component="header"
      bgcolor="#ffffff"
      sx={{ borderBottom: "5px solid #ffa500" }}
    >
      <Box
        display="grid"
        justifyItems="center"
        alignItems="center"
        paddingY="5px"
        paddingX="15px"
        className={style.headerContent}
      >
        <Image
          src="osg.png"
          width={315 * 0.6}
          height={70 * 0.6}
          alt="OSG Logo"
          className={style.osgLogo}
        />
        <ButtonGroup
          variant="outlined"
          aria-label="Information Sources"
          className={style.buttonGroup}
        >
          <Button
            LinkComponent={Link}
            href="status-map"
            aria-label="Status Map"
          >
            Status Map
          </Button>
          <Button LinkComponent={Link} href="jobs" aria-label="Jobs">
            Jobs
          </Button>
          <Button LinkComponent={Link} href="cpu-hours" aria-label="CPU Hours">
            CPU Hours
          </Button>
        </ButtonGroup>
        <Image
          src="nsf.png"
          width={584 * 0.4}
          height={140 * 0.4}
          alt="NSF Logo"
          className={style.nsfLogo}
        />
      </Box>
    </Box>
  );
};

export default Header;
