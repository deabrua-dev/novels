import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  MenuItem,
  Paper,
  Select,
  TextField,
  Box,
  InputLabel,
  FormControl,
  Backdrop,
  CircularProgress,
  Typography,
  Skeleton,
} from "@mui/material";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import toast from "react-hot-toast";

const EditNovel = () => {
  dayjs.extend(customParseFormat);
  const navigate = useNavigate();
  const { novelId } = useParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState(dayjs());
  const [author, setAuthor] = useState("");
  const [genres, setGenres] = useState([]);
  const [coverImg, setCoverImg] = useState(null);
  const imgRef = useRef(null);

  const { data: novel, isLoading } = useQuery({
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

  const { mutate: UpdateNovel, isPending } = useMutation({
    mutationFn: async () => {
      try {
        const year = date.year();
        const res = await fetch("/api/novel/update/" + novelId, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            description,
            status,
            year,
            author,
            genres,
            coverImg,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong.");
        }
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      navigate("/novel/" + novelId);
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });

  const a_genres = useQuery({
    queryKey: ["a_genres" + novelId],
    queryFn: async () => {
      try {
        const res = await fetch("/api/genre/all");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    UpdateNovel();
  };

  useEffect(() => {
    if (!isLoading && !a_genres.isLoading) {
      setTitle(novel.title);
      setDescription(novel.description);
      setStatus(novel.status);
      setGenres(Array.from(novel.genres));
      setDate(dayjs(novel.year, "YYYY"));
      setAuthor(novel.author);
      setCoverImg(novel.coverImg);
    }
  }, [isLoading, a_genres.isLoading]);

  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCoverImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleClearImage = () => {
    if (coverImg) {
      setCoverImg(null);
    }
  };

  return (
    <>
      <Paper className="p-4 mt-4">
        {(isLoading || a_genres.isLoading) && (
          <Backdrop
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={true}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
        )}
        {(isLoading || a_genres.isLoading) && (
          <Skeleton variant="rectengular" height={500} />
        )}
        {!isLoading && a_genres && !a_genres.isLoading && (
          <Box
            className="flex flex-col gap-5"
            component="form"
            onSubmit={handleSubmit}
          >
            <Typography className="self-center" fontSize={30} fontWeight={700}>
              Edit novel: {novel.title}
            </Typography>
            {coverImg && (
              <img
                className="self-center"
                src={coverImg}
                alt="Test"
                height={300}
                width={225}
              />
            )}
            <Box className="self-center flex gap-4">
              <Button variant="contained" size="large" component="label">
                Load a cover
                <input
                  accept="image/png, image/jpeg"
                  type="file"
                  hidden
                  ref={imgRef}
                  onChange={handleImgChange}
                />
              </Button>
              {coverImg && (
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleClearImage}
                >
                  Delete Image
                </Button>
              )}
            </Box>
            <br />
            <br />
            <TextField
              variant="standard"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
            />
            <TextField
              multiline
              variant="standard"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
            />
            <FormControl>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <MenuItem value="inProgress">In progress</MenuItem>
                <MenuItem value="hiatus">Hiatus</MenuItem>
                <MenuItem value="ended">Ended</MenuItem>
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel>Genres</InputLabel>
              <Select
                label="Genres"
                multiple
                value={genres}
                onChange={(e) => setGenres(e.target.value)}
              >
                {a_genres.data.map((genre) => (
                  <MenuItem key={genre._id} value={genre._id}>
                    {genre.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label={"Year"}
                views={["year"]}
                value={date}
                onChange={setDate}
              />
            </LocalizationProvider>
            <TextField
              variant="standard"
              placeholder="Author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              fullWidth
            />
            <Button
              type="submit"
              size="large"
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              fullWidth
            >
              {isPending ? "Loading..." : "Update"}
            </Button>
          </Box>
        )}
      </Paper>
    </>
  );
};

export default EditNovel;
