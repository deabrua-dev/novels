import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Paper,
  Grid,
} from "@mui/material";

const ReviewTile = ({ review }) => {
  dayjs.extend(relativeTime);

  const { data: user, isLoading } = useQuery({
    queryKey: ["user" + review.user],
    queryFn: async () => {
      try {
        const res = await fetch("/api/user/get/" + review.user);
        const data = await res.json();
        if (data.error) return null;
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    retry: false,
  });
  return (
    <Box>
      {isLoading && <Box></Box>}
      {!isLoading && review && user && (
        <Paper sx={{ borderRadius: 10, my: 4, mx: 2 }}>
          <Grid container wrap="nowrap" spacing={2} sx={{ px: 4, pb: 2 }}>
            <Grid item>
              <IconButton size="small">
                {user.profileImg && <Avatar sx={{ width: 35, height: 35 }} />}
                <Avatar sx={{ width: 40, height: 40 }}>
                  {user.username.charAt(0)}
                </Avatar>
              </IconButton>
            </Grid>
            <Grid justifyContent="left" item xs>
              <Typography variant="h4" fontSize={18}>
                {user.username}
              </Typography>
              <Typography fontSize={18}>{review.body}</Typography>
              <Typography color={"gray"}>
                {dayjs(review.createdAt).fromNow()}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default ReviewTile;
