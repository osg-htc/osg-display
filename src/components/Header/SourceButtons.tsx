import { Button, ButtonGroup } from "@mui/material";
import Link from "next/link";
import React from "react";

const SourceButtons = () => {
  return (
    <ButtonGroup variant="outlined" aria-label="Data buttons">
      <Button LinkComponent={Link} href="/status-map">
        Status Map
      </Button>
      <Button LinkComponent={Link} href="/jobs">
        Jobs
      </Button>
      <Button LinkComponent={Link} href="/cpu-hours">
        CPU Hours
      </Button>
    </ButtonGroup>
  );
};

export default SourceButtons;
