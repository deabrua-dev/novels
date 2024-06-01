import { useQuery } from "@tanstack/react-query";
import {
  Box,
  CircularProgress,
  Paper,
  Typography,
  Backdrop,
  Pagination,
} from "@mui/material";
import toast from "react-hot-toast";
import SavedFeed from "../../components/SavedFeed";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const Saved = () => {
  const { userId } = useParams();
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const [page, setPage] = useState(1);
  const limit = 5;

  const {
    data: novels,
    isLoading,
    refetch,
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
    <Paper className="flex flex-col flex-nowrap gap-4 p-2 my-4">
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
          <Typography variant="h4">Bookmarks</Typography>
          <SavedFeed novels={novels} />
          <Pagination
            count={Math.ceil(parseInt(authUser.saves.length) / limit)}
            page={page}
            onChange={handlePageChange}
            shape="rounded"
          />
        </Box>
      )}
    </Paper>
  );
};

export default Saved;
