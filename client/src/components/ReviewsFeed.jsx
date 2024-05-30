import { Box, Typography, Pagination, Button } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import ReviewTile from "./ReviewTile";
import { useEffect, useState } from "react";
import MDEditor from "@uiw/react-md-editor";

const ReviewsFeed = ({ chapter, novel }) => {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const [commentBody, setCommentBody] = useState("");
  const [page, setPage] = useState(1);
  const limit = 5;

  const {
    data: reviews,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      try {
        const res = chapter
          ? await fetch(
              "/api/chapter/reviews/" +
                chapter._id +
                "?page=" +
                (page - 1) +
                "&limit=" +
                limit
            )
          : await fetch(
              "/api/novel/reviews/" +
                novel._id +
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
    retry: 2,
  });
  const addNovelReview = useMutation({
    mutationFn: async () => {
      try {
        const userId = authUser._id;
        const res = await fetch("/api/novel/review/" + novel._id, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: userId, text: commentBody }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create review");
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success("Review created successfully");
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });
  const addChapterReview = useMutation({
    mutationFn: async () => {
      try {
        const userId = authUser._id;
        const res = await fetch("/api/chapter/review/" + chapter._id, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: userId, text: commentBody }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create review");
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success("Review created successfully");
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });
  useEffect(() => {
    refetch();
  }, [page, refetch]);

  const handlePageChange = (e, value) => {
    setPage(value);
  };
  const handleSend = (e) => {
    e.preventDefault();
    if (!authUser) {
      toast.error("To add a review you must log in");
    } else {
      if (novel) {
        addNovelReview.mutate();
      } else if (chapter) {
        addChapterReview.mutate();
      }
    }
  };
  return (
    <Box className="p-4">
      <Box className="flex flex-col gap-4">
        <Typography className="px-4" fontSize={20} fontWeight={700}>
          Create a review
        </Typography>
        <Box className="px-4">
          <MDEditor
            value={commentBody}
            onChange={setCommentBody}
            height={150}
            preview="edit"
            overflow="hidden"
            hideToolbar={true}
          />
        </Box>
        <Box className="mx-4 mb-4">
          <Button
            className="self-start"
            variant="contained"
            onClick={handleSend}
          >
            Send
          </Button>
        </Box>
      </Box>
      {!isLoading && reviews && (
        <Box>
          {!isRefetching && (
            <Box>
              {reviews.map((review) => (
                <ReviewTile key={review._id} id={review._id} review={review} />
              ))}
              <Pagination
                count={Math.ceil(
                  (chapter ? chapter.reviews.length : novel.reviews.length) /
                    limit
                )}
                page={page}
                onChange={handlePageChange}
                shape="rounded"
              />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ReviewsFeed;
