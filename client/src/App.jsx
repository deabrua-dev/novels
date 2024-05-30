import { Toaster } from "react-hot-toast";
import { Route, Routes } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Backdrop, CircularProgress, Container } from "@mui/material";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Novel from "./pages/Novel";
import Genre from "./pages/Genre";
import Profile from "./pages/Profile";
import Chapter from "./pages/Chapter";
import Register from "./pages/Register";
import CreateNovel from "./pages/CreateNovel";

import Footer from "./components/Footer";
import Navbar from "./components/Navbar";

import AnonymousRoute from "./middleware/AnonymousRoute";
import ModeratorRoute from "./middleware/ModeratorRoute";
import Author from "./pages/Author";
import Year from "./pages/Year";

function App() {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me");
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
    retry: false,
  });

  if (isLoading) {
    return (
      <>
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </>
    );
  }
  return (
    <>
      <Navbar />
      <Container maxWidth="lg">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/novel/:novelId" element={<Novel />} />
          <Route path="/chapter/:chapterId" element={<Chapter />} />
          <Route path="/genre/:genreId" element={<Genre />} />
          <Route path="/author/:author" element={<Author />} />
          <Route path="/year/:year" element={<Year />} />
          <Route element={<AnonymousRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route Route element={<ModeratorRoute />}>
            <Route path="/add-novel" element={<CreateNovel />} />
          </Route>
        </Routes>
      </Container>
      <Footer />
      <Toaster />
    </>
  );
}

export default App;
