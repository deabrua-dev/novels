import { useQuery } from "@tanstack/react-query";
import NovelsFeed from "../components/NovelsFeed";
import {
  Box,
  Skeleton,
  Backdrop,
  CircularProgress,
  Pagination,
  Paper,
  Typography,
} from "@mui/material";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

const Year = () => {
  const { year } = useParams();
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data: novels_l } = useQuery({
    queryKey: ["novels_l" + year],
    queryFn: async () => {
      try {
        const res = await fetch("/api/novel/countByYear/" + year);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const {
    data: novels,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["novels"],
    queryFn: async () => {
      try {
        const res = await fetch(
          "/api/novel/year/" + year + "?page=" + (page - 1) + "&limit=" + limit
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
  return (
    <Paper className="flex flex-col flex-nowrap gap-4 p-2 mt-4">
      {isLoading && (
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={true}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      )}
      {(isLoading || isRefetching) && (
        <Box>
          <Skeleton variant="rectengular" height={232} />
          <Skeleton variant="rectengular" height={232} />
          <Skeleton variant="rectengular" height={232} />
        </Box>
      )}
      {!isLoading && !novels && <Navigate to={"/404"} />}
      {!isLoading && !isRefetching && novels && (
        <Box>
          <Typography variant="h4">Year: {year}</Typography>
          <NovelsFeed novels={novels} />
          <Pagination
            count={Math.ceil(parseInt(novels_l) / limit)}
            page={page}
            onChange={handlePageChange}
            shape="rounded"
          />
        </Box>
      )}
    </Paper>
  );
};

export default Year;
