import { useEffect, useState } from "react";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Divider,
  Modal,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ReviewsFeed from "../../components/ReviewsFeed";

import { ChatBubble, Visibility } from "@mui/icons-material";
import MDEditor from "@uiw/react-md-editor";

const Chapter = () => {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const { chapterId } = useParams();
  const [chapterBody, setChapterBody] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();

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
        const res = await fetch("/api/chapter/next/" + chapterId);
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
        const res = await fetch("/api/chapter/prev/" + chapterId);
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

  const { mutate: updateChapter, isPending } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/chapter/update/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ chapterId, chapterTitle, chapterBody }),
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
    onSuccess: () => {
      toast.success("Chapter created successfully");
      handleClose();
      queryClient.refetchQueries();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onPageLoad = () => {
    viewCountIncrease();
  };

  const handleOpen = () => {
    if (!isLoading && chapter) {
      setChapterTitle(chapter.title);
      setChapterBody(chapter.body);
    }
    setOpen(true);
  };
  const handleClose = () => {
    setChapterTitle("");
    setChapterBody("");
    setOpen(false);
  };

  const handleChapterSave = (e) => {
    e.preventDefault();
    updateChapter();
  };

  useEffect(() => {
    onPageLoad();
  }, []);

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
      {!isLoading && !chapter && <Navigate to={"/404"} />}
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
            <Box className="flex gap-2">
              {authUser && authUser.isModerator && (
                <Button onClick={handleOpen}>Edit</Button>
              )}
              <Button
                component={Link}
                variant="contained"
                disabled={!next_chapter}
                to={next_chapter && "/chapter/" + next_chapter._id}
              >
                Next
              </Button>
            </Box>
          </Box>
          <Typography variant="h6" fontWeight={700} className="pt-4">
            Chapter {chapter.chapterNumber} - {chapter.title}
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
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box className="flex flex-col gap-4" sx={modalStyle}>
              <Typography variant="h6" component="h2">
                New chapter
              </Typography>
              <TextField
                variant="standard"
                placeholder="Title"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                fullWidth
              />
              <MDEditor
                value={chapterBody}
                onChange={setChapterBody}
                height={400}
                preview="edit"
                overflow="hidden"
                hideToolbar={true}
              />
              <Box className="flex flex-nowrap gap-4">
                <Button
                  variant="contained"
                  size="medium"
                  onClick={handleChapterSave}
                >
                  {isPending ? "Loading..." : "Save"}
                </Button>
                <Button variant="contained" size="medium" onClick={handleClose}>
                  Cancel
                </Button>
              </Box>
            </Box>
          </Modal>
        </Box>
      )}
    </Paper>
  );
};

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  height: 740,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default Chapter;
