import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Skeleton,
  Backdrop,
  CircularProgress,
  Paper,
  Typography,
  Avatar,
  Divider,
} from "@mui/material";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Link, useParams } from "react-router-dom";
import ReviewTile from "../components/ReviewTile";

const Profile = () => {
  const { userId } = useParams();

  const { data: user, isLoading } = useQuery({
    queryKey: ["getUserProfile"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/user/get/" + userId);
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
  });
  const { data: userReviews } = useQuery({
    queryKey: ["userReviews"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/user/reviews/" + userId);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
  });

  return (
    <Paper className="p-2 mt-4">
      {isLoading && (
        <Backdrop
          sx={{
            color: "#fff",
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
          open={true}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      )}
      {!isLoading && user && (
        <Box fullwidth>
          <Box className="flex flex-col w-full px-20 gap-4">
            <Box className="flex flex-nowrap justify-between items-center w-full px-20">
              <Typography fontSize={24} fontWeight={700}>
                User: {user.username}
              </Typography>
              <Avatar sx={{ width: 96, height: 96 }}>
                {user.username.charAt(0)}
              </Avatar>
            </Box>
            <Box className="mt-4">
              <Typography fontSize={20} fontWeight={700}>
                About:
              </Typography>
              <Typography fontSize={18}>{user.about}</Typography>
            </Box>
            <Divider component={"div"}>
              <Typography fontSize={20}>Information</Typography>
            </Divider>
            <Box className="flex justify-between items-center ">
              <Typography fontSize={18} color={"gray"}>
                Name:
              </Typography>
              <Typography fontSize={18}>{user.username}</Typography>
            </Box>
            <Divider />
            <Box className="flex justify-between items-center ">
              <Typography fontSize={18} color={"gray"}>
                Registered:
              </Typography>
              <Typography fontSize={18}>
                {dayjs(user.createdAt).format("MMMM D, YYYY h:mm A")}
              </Typography>
            </Box>
            <Divider />
            <Box className="flex justify-between items-center ">
              <Typography fontSize={18} color={"gray"}>
                User role:
              </Typography>
              <Typography fontSize={18}>
                {user.isModerator ? "Moderator" : "User"}
              </Typography>
            </Box>
            <Divider />
            <Box className="flex justify-between items-center ">
              <Typography fontSize={18} color={"gray"}>
                Count of reviews:
              </Typography>
              <Typography fontSize={18}>{user.reviews.length}</Typography>
            </Box>
            <Divider />

            <Box>
              <Typography fontSize={20} fontWeight={700}>
                Reviews:
              </Typography>
              {user.reviews.length > 0 && userReviews && (
                <Box>
                  {userReviews.map((review) => (
                    <Link
                      key={review._id}
                      to={
                        "/" +
                        (review.novel
                          ? "novel/" + review.novel
                          : "chapter/" + review.chapter)
                      }
                    >
                      <ReviewTile review={review} />
                    </Link>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default Profile;
