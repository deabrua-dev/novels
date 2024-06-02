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
import { Link } from "react-router-dom";
import { stringToColor } from "../stringToColor";

const ReviewTile = ({ review, linksDisabled }) => {
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
      {!isLoading && review && user && (
        <Paper sx={{ borderRadius: 10, my: 4, mx: 2 }}>
          <Grid container wrap="nowrap" spacing={2} sx={{ px: 4, pb: 2 }}>
            <Grid item>
              {linksDisabled ? (
                <IconButton size="small" disabled={linksDisabled}>
                  {user.profileImg ? (
                    <Avatar
                      sx={{ width: 40, height: 40 }}
                      src={user.profileImg}
                    />
                  ) : (
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: stringToColor(user.username),
                      }}
                    >
                      {user.username.charAt(0)}
                    </Avatar>
                  )}
                </IconButton>
              ) : (
                <IconButton
                  size="small"
                  component={Link}
                  to={"/profile/" + user._id}
                >
                  {user.profileImg ? (
                    <Avatar
                      sx={{ width: 40, height: 40 }}
                      src={user.profileImg}
                    />
                  ) : (
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: stringToColor(user.username),
                      }}
                    >
                      {user.username.charAt(0)}
                    </Avatar>
                  )}
                </IconButton>
              )}
            </Grid>
            <Grid justifyContent="left" item xs>
              {linksDisabled ? (
                <Typography variant="h4" fontSize={18} fontWeight={700}>
                  {user.username}
                </Typography>
              ) : (
                <Link to={"/profile/" + user._id}>
                  <Typography variant="h4" fontSize={18} fontWeight={700}>
                    {user.username}
                  </Typography>
                </Link>
              )}
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
