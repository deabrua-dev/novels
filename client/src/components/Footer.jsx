import { Box, Container, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box className="flex bg-slate-200 border mt-10 h-20 bottom-0 relative w-full">
      <Container maxWidth="lg">
        <Box className="flex justify-between items-center pt-6">
          <Typography fontSize={18}>
            thenovels.com (The Novels) - Read web-novels for free
          </Typography>
          <a href="mailto:dmca@thenovels.com">
            <Typography className="no-underline hover:underline hover:text-cyan-600">
              DMCA Notification
            </Typography>
          </a>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
