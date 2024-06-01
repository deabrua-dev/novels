/* eslint-disable react/prop-types */
import {
  Card,
  Box,
  CardMedia,
  CardContent,
  Typography,
  Rating,
  CardActionArea,
  Divider,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

const NovelTile = ({ novel }) => {
  const currentRating = novel.starRating
    ? novel.starRating.map((item) => item.rating).reduce((a, b) => a + b, 0) /
      novel.starRating.length
    : 0;

  const getGenres = useQuery({
    queryKey: ["genres" + novel._id],
    queryFn: async () => {
      try {
        const res = await fetch("/api/novel/genres/" + novel._id);
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
          <Box className="mt-2 flex items-center gap-2">
            <Rating
              name="half-rating"
              value={currentRating}
              precision={0.5}
              readOnly
            />
            <Typography>{parseFloat(currentRating).toFixed(2)}</Typography>
            <Typography>({novel.starRating.length} ratings)</Typography>
          </Box>
          <Box className="mt-2 flex gap-2">
            <Box className="flex gap-2">
              <Typography fontSize={14} color={"gray"}>
                Author:{" "}
              </Typography>
              <Link to={"/author/" + novel.author}>
                <Typography
                  fontSize={14}
                  className="no-underline hover:underline hover:text-cyan-600"
                >
                  {novel.author}
                </Typography>
              </Link>
            </Box>
            {!getGenres.isLoading && getGenres.data && (
              <Box className="flex gap-2">
                <Divider orientation="vertical" />
                <Typography fontSize={14} color={"gray"}>
                  Genres:
                </Typography>
                {getGenres.data.map((genre) => (
                  <Link key={genre._id} to={"/genre/" + genre._id}>
                    <Typography
                      fontSize={14}
                      className="no-underline hover:underline hover:text-cyan-600"
                    >
                      {genre.name}
                    </Typography>
                  </Link>
                ))}
              </Box>
            )}
          </Box>
        </CardContent>
      </Box>
    </Card>
  );
};

export default NovelTile;
