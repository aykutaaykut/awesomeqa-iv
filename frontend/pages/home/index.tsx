import * as React from "react";
import { NextPage } from "next";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { useRouter } from "next/router";
import AwesomeButton from "../../components/AwesomeButton";

const Home: NextPage = () => {
  const router = useRouter();

  return (
    <>
      <Box sx={{ flexGrow: 1, mt: 15, mb: 15 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
              <AwesomeButton
                text={"Knowledge Base"}
                icon={"/library_books.svg"}
              />
              <AwesomeButton
                text={"Tickets"}
                icon={"/support_agent.svg"}
                onClick={async () => {
                  router.push("/tickets?tab=open&page=1");
                }}
              />
              <AwesomeButton
                text={"FQA Insights"}
                icon={"/lightbulb.svg"}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default Home;
