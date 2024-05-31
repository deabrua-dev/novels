import { Toaster } from "react-hot-toast";
import { Route, Routes } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Backdrop, CircularProgress, Container } from "@mui/material";

import Home from "./pages/Home";
import Page404 from "./pages/Page404";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

import Novel from "./pages/Novel/Novel";
import Chapter from "./pages/Novel/Chapter";
import CreateNovel from "./pages/Novel/CreateNovel";

import Profile from "./pages/User/Profile";
import Saved from "./pages/User/Saved";

import Year from "./pages/Search/Year";
import Genre from "./pages/Search/Genre";
import Author from "./pages/Search/Author";

import Footer from "./components/Footer";
import Navbar from "./components/Navbar";

import AnonymousRoute from "./middleware/AnonymousRoute";
import ModeratorRoute from "./middleware/ModeratorRoute";
import PrivateRoute from "./middleware/PrivateRoute";
import EditNovel from "./pages/Novel/EditNovel";

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
          <Route path="/404" element={<Page404 />} />
          <Route path="/year/:year" element={<Year />} />
          <Route path="/novel/:novelId" element={<Novel />} />
          <Route path="/genre/:genreId" element={<Genre />} />
          <Route path="/author/:author" element={<Author />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/chapter/:chapterId" element={<Chapter />} />
          <Route element={<AnonymousRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route Route element={<ModeratorRoute />}>
            <Route path="/add-novel" element={<CreateNovel />} />
            <Route path="/update/:novelId" element={<EditNovel />} />
          </Route>
          <Route Route element={<PrivateRoute />}>
            <Route path="/saved/:userId" element={<Saved />} />
          </Route>
        </Routes>
      </Container>
      <Footer />
      <Toaster />
    </>
  );
}

export default App;
