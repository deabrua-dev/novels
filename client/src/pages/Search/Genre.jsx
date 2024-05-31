import { useQuery } from "@tanstack/react-query";
import NovelsFeed from "../../components/NovelsFeed";
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
import { useParams } from "react-router-dom";

const Genre = () => {
  const { genreId } = useParams();
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data: genre } = useQuery({
    queryKey: ["genre" + genreId],
    queryFn: async () => {
      try {
        const res = await fetch("/api/genre/" + genreId);
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
  const { data: novels_l } = useQuery({
    queryKey: ["novels_l" + genreId],
    queryFn: async () => {
      try {
        const res = await fetch("/api/genre/countNovels/" + genreId);
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
          "/api/genre/novels/" +
            genreId +
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
      {(isLoading || isRefetching) && (
        <Box>
          <Skeleton variant="rectengular" height={232} />
          <Skeleton variant="rectengular" height={232} />
          <Skeleton variant="rectengular" height={232} />
        </Box>
      )}
      {!isLoading && !isRefetching && novels && (
        <Box>
          <Typography variant="h4">Genre: {genre.name}</Typography>
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

export default Genre;
