import { useQuery } from "@tanstack/react-query";
import NovelTile from "./NovelTile";
import { Box } from "@mui/material";

const NovelsFeed = ({ novels }) => {

  return (
    <>
      {novels && (
        <Box>
          {novels.map((novel) => (
            <NovelTile key={novel._id} novel={novel} />
          ))}
        </Box>
      )}
    </>
  );
};

export default NovelsFeed;
