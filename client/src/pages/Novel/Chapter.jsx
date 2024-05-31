import { useEffect } from "react";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ReviewsFeed from "../../components/ReviewsFeed";

import { ChatBubble, Visibility } from "@mui/icons-material";

const Chapter = () => {
  const { chapterId } = useParams();

  const {
    data: chapter,
    isLoading,
    isRefetching,
  } = useQuery({
    queryKey: ["chapter"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/chapter/get/" + chapterId);
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

  const { data: next_chapter } = useQuery({
    queryKey: ["next_chapter"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/chapter/next-chapter/" + chapterId);
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

  const { data: prev_chapter } = useQuery({
    queryKey: ["prev_chapter"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/chapter/prev-chapter/" + chapterId);
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
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: viewCountIncrease } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/chapter/addViewCount/" + chapterId, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
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

  const onPageLoad = () => {
    viewCountIncrease();
  };

  useEffect(() => {
    onPageLoad();
  }, []);
  const queryClient = useQueryClient();
  useEffect(() => {
    queryClient.refetchQueries();
    onPageLoad();
  }, [chapterId]);

  return (
    <Paper className="py-5 px-10 mt-4">
      {(isLoading || isRefetching) && (
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
      {!isLoading && chapter && (
        <Box className="p-4 flex flex-col gap-4">
          <Box className="flex justify-between">
            <Button
              component={Link}
              variant="contained"
              disabled={!prev_chapter}
              to={prev_chapter && "/chapter/" + prev_chapter._id}
            >
              Prev
            </Button>
            <Button
              component={Link}
              variant="contained"
              to={"/novel/" + chapter.novel}
            >
              Novel Page
            </Button>
            <Button
              component={Link}
              variant="contained"
              disabled={!next_chapter}
              to={next_chapter && "/chapter/" + next_chapter._id}
            >
              Next
            </Button>
          </Box>
          <Typography variant="h6" fontWeight={700} className="pt-4">
            Chapter {chapter.chapterNumber} {chapter.title}
          </Typography>
          <Typography fontSize={18} sx={{ whiteSpace: "pre-wrap" }}>
            {chapter.body.split("\\n").map((item, i) => {
              return (
                <span key={i}>
                  {item}
                  <br />
                </span>
              );
            })}
          </Typography>
          <Box className="border rounded-xl h-10 flex flex-nowrap items-center px-4 gap-4">
            <Box className="flex gap-1">
              <Visibility />
              <Typography fontSize={16} fontWeight={400}>
                {chapter.viewsCount.toLocaleString()}
              </Typography>
            </Box>
            <Box className="flex gap-1">
              <ChatBubble />
              <Typography fontSize={16} fontWeight={400}>
                {chapter.reviews.length.toLocaleString()}
              </Typography>
            </Box>
          </Box>
          <Box className="flex justify-between pt-4">
            <Button
              component={Link}
              variant="contained"
              disabled={!prev_chapter}
              to={prev_chapter && "/chapter/" + prev_chapter._id}
            >
              Prev
            </Button>
            <Button
              component={Link}
              variant="contained"
              to={"/novel/" + chapter.novel}
            >
              Novel Page
            </Button>
            <Button
              component={Link}
              variant="contained"
              disabled={!next_chapter}
              to={next_chapter && "/chapter/" + next_chapter._id}
            >
              Next
            </Button>
          </Box>
          <Box>
            <Divider />
            <ReviewsFeed chapter={chapter} />
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default Chapter;
