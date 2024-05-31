import SavedTile from "./SavedTile";
import { Box } from "@mui/material";

// eslint-disable-next-line react/prop-types
const SavedFeed = ({ novels }) => {
  return (
    <>
      {novels && (
        <Box>
          {novels.map((novel) => (
            <SavedTile key={novel._id} novel={novel} />
          ))}
        </Box>
      )}
    </>
  );
};

export default SavedFeed;
