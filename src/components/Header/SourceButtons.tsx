import { Button, ButtonGroup } from "@mui/material";
import Link from "next/link";
import React from "react";

const SourceButtons = () => {
  return (
    <ButtonGroup variant="outlined" aria-label="Information Sources">
      <Button LinkComponent={Link} href="/status-map" aria-label="Status Map">
        Status Map
      </Button>
      <Button LinkComponent={Link} href="/jobs" aria-label="Jobs">
        Jobs
      </Button>
      <Button LinkComponent={Link} href="/cpu-hours" aria-label="CPU Hours">
        CPU Hours
      </Button>
    </ButtonGroup>
  );
};

export default SourceButtons;
