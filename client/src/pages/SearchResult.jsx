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
import { useParams } from "react-router-dom";

const SearchResult = () => {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const { searchQuery } = useParams();
  const {
    data: novels,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["searchedNovels"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/novel/search/" + searchQuery);
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
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default SearchResult;
