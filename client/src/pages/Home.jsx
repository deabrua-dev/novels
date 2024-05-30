import { useQuery } from "@tanstack/react-query";
import NovelsFeed from "../components/NovelsFeed";
import {
  Box,
  Skeleton,
  Backdrop,
  CircularProgress,
  Pagination,
  Paper,
} from "@mui/material";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";

const Home = () => {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const [page, setPage] = useState(1);
  const limit = 2;
  const { data: novels_l } = useQuery({
    queryKey: ["novels_l"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/novel/count");
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
          "/api/novel/novels?page=" + (page - 1) + "&limit=" + limit
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
    onError: (error) => {
      toast.error(error.message);
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
      {!isLoading && novels && (
        <Box>
          {isRefetching && (
            <Box>
              <Skeleton variant="rectengular" height={232} />
              <Skeleton variant="rectengular" height={232} />
              <Skeleton variant="rectengular" height={232} />
            </Box>
          )}
          {!isRefetching && (
            <Box>
              <NovelsFeed novels={novels} />
              <Pagination
                count={Math.ceil(parseInt(novels_l) / limit)}
                page={page}
                onChange={handlePageChange}
                shape="rounded"
              />
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default Home;
