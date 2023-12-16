import { Box, Link, Typography } from "@mui/material";

const HomeHeader = () => {
  return (
    <Link href="/" sx={{ textDecoration: "none", color: "inherit" }}>
      <Box
        sx={{
          border: 1,
          justifyContent: "center",
          mt: 5,
          borderRadius: 2,
          padding: 1,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Typography variant="h2" component="div">
            Awesome tech challenge
          </Typography>
        </Box>
      </Box>
    </Link>
  );
};

export default HomeHeader;
