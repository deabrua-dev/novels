import { useQuery } from "@tanstack/react-query";
import NovelsFeed from "../../components/NovelsFeed";
import {
  Box,
  Skeleton,
  Backdrop,
  CircularProgress,
  Typography,
  Paper,
  Pagination,
} from "@mui/material";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const SearchResult = () => {
  const { searchQuery } = useParams();
  const [page, setPage] = useState(1);
  const limit = 5;
  const countSearchResult = useQuery({
    queryKey: ["length" + searchQuery],
    queryFn: async () => {
      try {
        const res = await fetch("/api/novel/countSearch/" + searchQuery);
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
    queryKey: ["searchedNovels"],
    queryFn: async () => {
      try {
        const res = await fetch(
          "/api/novel/search/" +
            searchQuery +
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
    countSearchResult.refetch();
  }, [searchQuery]);
  useEffect(() => {
    refetch();
  }, [page, refetch]);
  const handlePageChange = (e, value) => {
    setPage(value);
  };
  return (
    <Paper className="flex flex-col flex-nowrap gap-4 p-2 mt-4">
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
          <Skeleton variant="rectengular" height={232} />
          <Skeleton variant="rectengular" height={232} />
          <Skeleton variant="rectengular" height={232} />
        </Box>
      )}
      {!isLoading &&
        !isRefetching &&
        novels &&
        !countSearchResult.isRefetching &&
        countSearchResult.data && (
          <Box>
            <Typography variant="h4">
              Search result for: {searchQuery}
            </Typography>
            <Box>
              <NovelsFeed novels={novels} />
              <Pagination
                count={Math.ceil(parseInt(countSearchResult.data) / limit)}
                page={page}
                onChange={handlePageChange}
                shape="rounded"
              />
            </Box>
          </Box>
        )}
    </Paper>
  );
};

export default SearchResult;
