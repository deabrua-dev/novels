import {
  Card,
  Box,
  CardMedia,
  CardContent,
  Typography,
  Rating,
  CardActionArea,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";

const NovelTile = ({ novel }) => {
  const currentRating = novel.starRating
    ? novel.starRating.map((item) => item.rating).reduce((a, b) => a + b, 0) /
      novel.starRating.length
    : 0;

  const [rating, setRating] = useState(currentRating);

  const queryClient = useQueryClient();
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
    onSuccess: (starRating) => {
      queryClient.setQueryData(["novels"], (oldData) => {
        return oldData.map((n) => {
          if (n._id === novel._id) {
            return { ...n, starRating: starRating };
          }
          return n;
        });
      });
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

  return (
    <Card className="flex flex-col p-4 my-4">
      <Box className="flex content-start">
        <CardActionArea
          component={Link}
          to={"/novel/" + novel._id}
          sx={{ height: 200, width: 150 }}
          className="flex-none"
        >
          <CardMedia
            component={"img"}
            className="border shadow-md rounded"
            image={novel.coverImg}
            alt="Novel Cover"
          />
        </CardActionArea>

        <CardContent className="flex flex-col" sx={{ pt: 0 }}>
          <Typography fontSize={20} fontWeight={700}>
            <Link to={"/novel/" + novel._id}>{novel.title}</Link>
          </Typography>
          <Typography
            fontSize={14}
            fontWeight={400}
            height={85}
            overflow={"hidden"}
            textOverflow={"ellipsis"}
          >
            {novel.description.split("\\n").map((item, i) => {
              return (
                <span key={i}>
                  {item}
                  <br />
                </span>
              );
            })}
          </Typography>
          <Box className="mt-2">
            <Rating
              name="half-rating"
              value={rating}
              onChange={(e) => handleRatingSet(e)}
              precision={0.5}
              readOnly
            />
          </Box>
        </CardContent>
      </Box>
    </Card>
  );
};

export default NovelTile;
