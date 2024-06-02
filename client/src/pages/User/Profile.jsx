import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Backdrop,
  CircularProgress,
  Paper,
  Typography,
  Avatar,
  Divider,
  Pagination,
  Skeleton,
} from "@mui/material";
import dayjs from "dayjs";
import { Link, Navigate, useParams } from "react-router-dom";
import ReviewTile from "../../components/ReviewTile";
import { useEffect, useState } from "react";
import { stringToColor } from "../../stringToColor";

const Profile = () => {
  const { userId } = useParams();
  const [page, setPage] = useState(1);
  const limit = 5;

  const {
    data: user,
    isLoading,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["getUserProfile" + userId],
    queryFn: async () => {
      try {
        const res = await fetch("/api/user/get/" + userId);
        const data = await res.json();
        if (data.error) {
          throw new Error(data.error || "Something went wrong");
        }
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    retry: 1,
  });

  const {
    data: userReviews,
    isRefetching,
    refetch,
  } = useQuery({
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

  useEffect(() => {
    refetch();
  }, [page, refetch]);

  const handlePageChange = (e, value) => {
    setPage(value);
  };

  return (
    <Paper className="p-2 my-4">
      {(isLoading || isPending) && (
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
      {(isLoading || isPending) && (
        <Skeleton variant="rectengular" height={400} />
      )}
      {!isLoading && user && (
        <Box fullwidth className="mb-10">
          <Box className="flex flex-col w-full px-20 gap-4">
            <Box className="flex flex-col justify-between items-center w-full px-20 mt-10">
              <Avatar
                sx={{
                  width: 96,
                  height: 96,
                  bgcolor: stringToColor(user.username),
                }}
              >
                {user.username.charAt(0)}
              </Avatar>
              <Typography fontSize={24} fontWeight={700}>
                User: {user.username}
              </Typography>
            </Box>
            <Box className="mt-4">
              <Typography fontSize={20} fontWeight={700}>
                About:
              </Typography>
              <Typography fontSize={18}>{user.about}</Typography>
            </Box>
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
                Number of comments:
              </Typography>
              <Typography fontSize={18}>{user.reviews.length}</Typography>
            </Box>

            <Divider />
            {userReviews &&
              userReviews.totalCount > 0 &&
              !(isLoading || isRefetching) && (
                <Box>
                  <Typography fontSize={20} fontWeight={700}>
                    Comments:
                  </Typography>
                  <Box>
                    {userReviews.pageData.map((review) => (
                      <Link
                        key={review._id}
                        to={
                          "/" +
                          (review.novel
                            ? "novel/" + review.novel
                            : "chapter/" + review.chapter)
                        }
                      >
                        <ReviewTile review={review} linksDisabled={true} />
                      </Link>
                    ))}
                    <Pagination
                      count={Math.ceil(
                        parseInt(userReviews.totalCount) / limit
                      )}
                      page={page}
                      onChange={handlePageChange}
                      shape="rounded"
                    />
                  </Box>
                </Box>
              )}
          </Box>
        </Box>
      )}
      {isError && <Navigate to={"/404"} />}
    </Paper>
  );
};

export default Profile;
