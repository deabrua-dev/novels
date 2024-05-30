import { useState, useRef } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Button,
  MenuItem,
  Paper,
  Select,
  TextField,
  Box,
  InputLabel,
  FormControl,
} from "@mui/material";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import toast from "react-hot-toast";

const CreateNovel = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState(dayjs());
  const [author, setAuthor] = useState("");
  const [genres, setGenres] = useState([]);
  const [coverImg, setCoverImg] = useState(null);
  const imgRef = useRef(null);

  const {
    mutate: CreateNovel,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async () => {
      try {
        const year = date.year();
        const res = await fetch("/api/novel/create", {
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
          throw new Error(data.error || "Something went wrong");
        }
        navigate("/");
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });

  const {
    data: a_genres,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["a_genres"],
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
    CreateNovel();
  };

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

  return (
    <>
      <Paper className="p-2 mt-4">
        <Box
          className="flex flex-col gap-5"
          component="form"
          onSubmit={handleSubmit}
        >
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
          {!isLoading && (
            <FormControl>
              <InputLabel>Genres</InputLabel>
              <Select
                label="Genres"
                multiple
                value={genres}
                onChange={(e) => setGenres(e.target.value)}
              >
                {a_genres.map((genre) => (
                  <MenuItem key={genre.name} value={genre.name}>
                    {genre.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
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
            {isPending ? "Loading..." : "Add Novel"}
          </Button>
        </Box>
      </Paper>
    </>
  );
};

export default CreateNovel;
