import {
  Card,
  Box,
  Typography,
  Rating,
  IconButton,
  Avatar,
  Grid,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Cached, Delete } from "@mui/icons-material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

const SavedTile = ({ novel }) => {
  dayjs.extend(relativeTime);
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const currentRating = novel.starRating
    ? novel.starRating.map((item) => item.rating).reduce((a, b) => a + b, 0) /
      novel.starRating.length
    : 0;
  const chapters = novel.chapters ? novel.chapters : [];
  const { data: chapter, isLoading } = useQuery({
    queryKey: ["chapter" + (chapters.length !== 0) ? chapters.at(-1) : "test"],
    queryFn: async () => {
      try {
        if (chapters.length === 0) {
          throw new Error("Chapters not found");
        }
        const res = await fetch("/api/chapter/get/" + chapters.at(-1));
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    retry: 1,
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const queryClient = useQueryClient();
  const { mutate: unSaveNovel } = useMutation({
    mutationFn: async () => {
      try {
        if (!authUser) {
          throw new Error("User not found");
        }
        const res = await fetch("/api/novel/unsave/" + novel._id, {
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
      queryClient.invalidateQueries({ queryKey: ["novels" + authUser._id] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleUnSave = (e) => {
    e.preventDefault();
    unSaveNovel();
  };

  return (
    <Card className="flex p-4 my-4">
      <Grid container spacing={2}>
        <Grid item xs={1}>
          <IconButton
            size="small"
            disableRipple={true}
            component={Link}
            to={"/novel/" + novel._id}
          >
            <Avatar sx={{ width: 80, height: 80 }} variant="rounded">
              <img src={novel.coverImg} alt="Novel Cover" />
            </Avatar>
          </IconButton>
        </Grid>
        <Grid item xs={10}>
          <Box className="ml-4">
            <Typography fontSize={20} fontWeight={700}>
              <Link to={"/novel/" + novel._id}>{novel.title}</Link>
            </Typography>
            {!isLoading && chapter && (
              <Link to={"/chapter/" + chapter._id}>
                <Typography color={"gray"}>
                  Chapter {chapter.chapterNumber} - {chapter.title}
                </Typography>
              </Link>
            )}
            <Box className="mt-2 flex items-center gap-2">
              <Rating value={currentRating} precision={0.5} readOnly />
              <Box className="flex align-middle gap-2 flex-nowrap">
                <Cached color="disabled" />
                <Typography color={"gray"}>
                  {dayjs(novel.updatedAt).fromNow()}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={1}>
          <Box className="flex justify-end items-center">
            <IconButton onClick={handleUnSave}>
              <Delete color="disabled" />
            </IconButton>
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
};

export default SavedTile;
