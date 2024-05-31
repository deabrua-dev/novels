import { Box, Typography } from "@mui/material";

const Page404 = () => {
  return (
    <Box className="flex flex-col justify-center items-center gap-4 my-40">
      <Typography variant="h2" fontSize={96} fontWeight={700}>
        404
      </Typography>
      <Typography fontSize={36}>Not Found</Typography>
    </Box>
  );
};

export default Page404;
