import {
  Box,
  Card,
  CircularProgress,
  Typography,
  Backdrop,
  CardContent,
} from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

const ChaptersFeed = ({ novel }) => {
  dayjs.extend(relativeTime);
  const {
    data: chapters,
    isLoading,
  } = useQuery({
    queryKey: ["chapters"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/chapter/novel/" + novel._id);
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
    <Box>
      {isLoading && (
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={true}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      )}
      {!isLoading && (
        <Box className="flex flex-wrap justify-between gap-4 my-4  px-10">
          {chapters.map((chapter) => (
            <Box
              key={chapter._id}
              component={Link}
              to={"/chapter/" + chapter._id}
            >
              <Card sx={{ width: 475, height: 75 }}>
                <CardContent>
                  <Box className="flex gap-4">
                    <Typography className="px-4" fontWeight={700} fontSize={30}>
                      {chapter.chapterNumber}
                    </Typography>
                    <Box>
                      <Typography>{chapter.title}</Typography>
                      <Typography color={"gray"}>
                        {dayjs(chapter.createdAt).fromNow()}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ChaptersFeed;
