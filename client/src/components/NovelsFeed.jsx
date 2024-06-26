import NovelTile from "./NovelTile";
import { Box } from "@mui/material";

// eslint-disable-next-line react/prop-types
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
