import { useEffect, useState } from "react";
import {
  Backdrop,
  Box,
  Button,
  CardMedia,
  CircularProgress,
  Divider,
  Grid,
  Modal,
  Paper,
  Rating,
  TextField,
  Typography,
} from "@mui/material";
import { Mode, Visibility } from "@mui/icons-material";
import { useMutation, useQuery } from "@tanstack/react-query";
import MDEditor from "@uiw/react-md-editor";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import ReviewsFeed from "../../components/ReviewsFeed";
import ChaptersFeed from "../../components/ChaptersFeed";

const Novel = () => {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const { novelId } = useParams();

  const [chapterBody, setChapterBody] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [rating, setRating] = useState(0.0);
  const [open, setOpen] = useState(false);

  const getGenres = useQuery({
    queryKey: ["genres" + novelId],
    queryFn: async () => {
      try {
        const res = await fetch("/api/novel/genres/" + novelId);
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

  const {
    data: novel,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [novelId],
    queryFn: async () => {
      try {
        const res = await fetch("/api/novel/get/" + novelId);
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

  const { mutate: ratingNovel, isPending } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/novel/rating/${novel._id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rating: rating,
          }),
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
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: viewCountIncrease } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/novel/addViewCount/" + novelId, {
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
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const addChapter = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/chapter/add/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ novelId, chapterTitle, chapterBody }),
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
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: saveNovel } = useMutation({
    mutationFn: async () => {
      try {
        if (!authUser) {
          throw new Error("User not found");
        }
        const res = await fetch("/api/novel/save/" + novelId, {
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
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleRatingSet = (e) => {
    e.preventDefault();
    setRating(e.target.value);
    ratingNovel();
  };

  const handleChapterSave = (e) => {
    e.preventDefault();
    addChapter.mutate();
  };

  const handleNovelSave = (e) => {
    e.preventDefault();
    saveNovel();
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setChapterTitle("");
    setChapterBody("");
    setOpen(false);
  };

  const onPageLoad = () => {
    viewCountIncrease();
  };

  useEffect(() => {
    onPageLoad();
  }, []);

  useEffect(() => {
    if (novel) {
      const currentRating = novel.starRating
        ? novel.starRating
            .map((item) => item.rating)
            .reduce((a, b) => a + b, 0) / novel.starRating.length
        : 0;
      setRating(currentRating);
    }
  }, [novel]);

  return (
    <Paper className="py-5 px-10 mt-4">
      {isLoading && (
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
      {!isLoading && novel && (
        <Grid container direction={"row"} spacing={2}>
          <Grid item xs={4} justifySelf={"center"}>
            <CardMedia
              className="border shadow-md rounded"
              component="img"
              height={200}
              width={150}
              sx={{ height: 400, width: 300 }}
              image={novel.coverImg}
              alt="Novel Cover"
            />
          </Grid>
          <Grid
            item
            xs={8}
            container
            direction={"column"}
            justifyContent={"space-between"}
          >
            <Grid item>
              <Typography fontSize={36} fontWeight={700}>
                {novel.title}
              </Typography>
              <Box className="flex align-middle gap-4">
                <Box className="flex align-middle gap-1 flex-nowrap">
                  <Mode />
                  <Typography fontSize={16}>
                    {getStatus(novel.status)}
                  </Typography>
                </Box>
                <Box className="flex align-middle gap-2 flex-nowrap">
                  <Visibility />
                  <Typography fontSize={16}>
                    {novel.viewsCount.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              <Box className="flex gap-2 my-2">
                <Typography color={"gray"}>Author: </Typography>
                <Link to={"/author/" + novel.author}>
                  <Typography className="no-underline hover:underline hover:text-cyan-600">
                    {novel.author}
                  </Typography>
                </Link>
              </Box>
              <Box className="flex gap-2 my-2">
                <Typography color={"gray"}>Year: </Typography>
                <Link to={"/year/" + novel.year}>
                  <Typography className="no-underline hover:underline hover:text-cyan-600">
                    {novel.year}
                  </Typography>
                </Link>
              </Box>
              {!getGenres.isLoading && getGenres.data && (
                <Box className="flex gap-2 my-2">
                  <Typography color={"gray"}>Genres:</Typography>
                  {getGenres.data.map((genre) => (
                    <Link key={genre._id} to={"/genre/" + genre._id}>
                      <Typography className="no-underline hover:underline hover:text-cyan-600">
                        {genre.name}
                      </Typography>
                    </Link>
                  ))}
                </Box>
              )}
              <Box>
                {(isPending || isLoading) && (
                  <Box className="flex items-center gap-2">
                    <Rating
                      value={parseFloat(rating)}
                      precision={0.5}
                      readOnly
                    />
                    <Typography fontSize={20}>
                      {parseFloat(rating).toFixed(2)}
                    </Typography>
                    <Typography>({novel.starRating.length} ratings)</Typography>
                  </Box>
                )}
                {!isPending && authUser && (
                  <Box className="flex items-center gap-2">
                    <Rating
                      value={parseFloat(rating)}
                      onChange={(e) => handleRatingSet(e)}
                      precision={0.5}
                    />
                    <Typography fontSize={20}>
                      {parseFloat(rating).toFixed(2)}
                    </Typography>
                    <Typography>({novel.starRating.length} ratings)</Typography>
                  </Box>
                )}
                {!isPending && !authUser && (
                  <Box className="flex items-center gap-2">
                    <Rating
                      value={parseFloat(rating)}
                      onChange={(e) => handleRatingSet(e)}
                      precision={0.5}
                      readOnly
                    />
                    <Typography fontSize={20}>
                      {parseFloat(rating).toFixed(2)}
                    </Typography>
                    <Typography>({novel.starRating.length} ratings)</Typography>
                  </Box>
                )}
              </Box>
            </Grid>
            <Grid item justifySelf={"end"} mt={10}>
              <Box className="flex flex-nowrap gap-4">
                <Button
                  variant="contained"
                  size="large"
                  component={Link}
                  to={
                    novel.chapters.length > 0
                      ? "/chapter/" + novel.chapters[0]
                      : ""
                  }
                >
                  Read
                </Button>
                {authUser &&
                  !Array.from(novel.savedBy).includes(authUser._id) && (
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleNovelSave}
                    >
                      Add to library
                    </Button>
                  )}
                {authUser &&
                  Array.from(novel.savedBy).includes(authUser._id) && (
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleNovelSave}
                      color="error"
                    >
                      Remove from library
                    </Button>
                  )}
                {authUser && authUser.isModerator && (
                  <Button
                    variant="contained"
                    size="large"
                    component={Link}
                    to={"/update/" + novel._id}
                  >
                    Edit novel
                  </Button>
                )}
                {authUser && authUser.isModerator && (
                  <Button variant="contained" size="large" onClick={handleOpen}>
                    Add chapter
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Box>
              <Divider />
              <Typography fontSize={30} fontWeight={700}>
                Description
              </Typography>
              <Typography fontSize={18} whiteSpace={"pre-wrap"}>
                {novel.description.split("\\n").map((item, i) => {
                  return (
                    <span key={i}>
                      {item}
                      <br />
                    </span>
                  );
                })}
              </Typography>
            </Box>
          </Grid>
          {novel.chapters.length > 0 && (
            <Grid item xs={12}>
              <Divider />
              <Box className="flex justify-center">
                <ChaptersFeed novel={novel} />
              </Box>
            </Grid>
          )}
          <Grid item xs={12}>
            <Divider />
            <ReviewsFeed novel={novel} />
          </Grid>
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
                  {addChapter.isPending ? "Loading..." : "Save"}
                </Button>
                <Button variant="contained" size="medium" onClick={handleClose}>
                  Cancel
                </Button>
              </Box>
            </Box>
          </Modal>
        </Grid>
      )}
    </Paper>
  );
};

function getStatus(status) {
  switch (status) {
    case "inProgress":
      return "In Progress";
    case "ended":
      return "Complete";
    case "hiatus":
      return "Hiatus";
    default:
      return "unknown";
  }
}

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

export default Novel;
