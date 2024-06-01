import { useQuery } from "@tanstack/react-query";
import {
  Box,
  CircularProgress,
  Paper,
  Typography,
  Backdrop,
  Pagination,
  Skeleton,
} from "@mui/material";
import SavedFeed from "../../components/SavedFeed";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const Saved = () => {
  const { userId } = useParams();
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const [page, setPage] = useState(1);
  const limit = 5;

  const navigate = useNavigate();

  const {
    data: novels,
    isLoading,
    refetch,
    isRefetching,
    isError,
  } = useQuery({
    queryKey: ["novels" + userId],
    queryFn: async () => {
      try {
        const res = await fetch(
          "/api/user/saves/" +
            userId +
            "?page=" +
            (page - 1) +
            "&limit=" +
            limit
        );
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

  if (userId != authUser._id) {
    navigate("/");
  }
  return (
    <Paper className="flex flex-col flex-nowrap gap-4 p-2 my-4">
      {(isLoading || isRefetching) && (
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={true}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      )}
      {(isLoading || isRefetching) && (
        <Box>
          <Skeleton variant="rectengular" height={150} />
          <Skeleton variant="rectengular" height={150} />
          <Skeleton variant="rectengular" height={150} />
        </Box>
      )}
      {!isLoading && novels && (
        <Box>
          <Typography variant="h4">Bookmarks</Typography>
          <SavedFeed novels={novels.pageData} />
          <Pagination
            count={Math.ceil(parseInt(novels.totalCount) / limit)}
            page={page}
            onChange={handlePageChange}
            shape="rounded"
          />
        </Box>
      )}
      {isError && <Navigate to={"/404"} />}
    </Paper>
  );
};

export default Saved;
