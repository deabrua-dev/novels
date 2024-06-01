import { Box, Typography, Pagination, Button, Skeleton } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
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
    queryKey: ["reviews" + (chapter ? chapter._id : novel._id)],
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
      toast.success("Comment created successfully");
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
      toast.success("Comment created successfully");
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
      toast.error("To add a comment you must log in");
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
          Add a comment
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
      {(isLoading || isRefetching) && (
        <Skeleton variant="rectengular" height={170} />
      )}
      {!isLoading && reviews && (
        <Box>
          {!isRefetching && (
            <Box>
              {reviews.pageData.map((review) => (
                <ReviewTile
                  key={review._id}
                  id={review._id}
                  review={review}
                  linksDisabled={false}
                />
              ))}
              <Pagination
                count={Math.ceil(parseInt(reviews.totalCount) / limit)}
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
