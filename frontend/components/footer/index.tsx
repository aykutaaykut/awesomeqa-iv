import { Box, Typography } from "@mui/material";
import styles from "./footer.module.css";

const Footer = () => {
  const heartEmoji = "\u2764";
  return (
    <footer className={styles.footer}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 15,
        }}
      >
        Made with {heartEmoji} at home
      </Box>
    </footer>
  );
};

export default Footer;
