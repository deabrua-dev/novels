import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Box,
  Backdrop,
  CircularProgress,
  Paper,
  Typography,
  Avatar,
  Divider,
  Pagination,
  Skeleton,
  Button,
  TextField,
  Modal,
  IconButton,
} from "@mui/material";
import dayjs from "dayjs";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import ReviewTile from "../../components/ReviewTile";
import { useEffect, useRef, useState } from "react";
import { stringToColor } from "../../stringToColor";
import toast from "react-hot-toast";
import { Edit } from "@mui/icons-material";

const Profile = () => {
  const { userId } = useParams();
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const limit = 5;

  const [open, setOpen] = useState(false);

  const [username, setUserName] = useState("");
  const [coverImg, setCoverImg] = useState(null);
  const imgRef = useRef(null);

  const {
    data: user,
    isLoading,
    isPending,
    isError,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["getUserProfile" + userId],
    queryFn: async () => {
      try {
        const res = await fetch("/api/user/get/" + userId);
        const data = await res.json();
        if (data.error) {
          throw new Error(data.error || "Something went wrong");
        }
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    retry: 1,
  });

  const {
    data: userReviews,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["userReviews"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/user/reviews/" + userId);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
  });

  const { mutate: updateUserInfo, isPending: isUpdating } = useMutation({
    mutationFn: async () => {
      try {
        if (userId !== authUser._id) {
          throw new Error("Permission denied");
        }
        const res = await fetch("/api/user/update/" + userId, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username,
            profileImg: coverImg,
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
      navigate("/profile/" + userId);
      toast.success("Profile updated successfully");
      handleClose();
      refetchUser();
      refetch();
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });

  useEffect(() => {
    refetch();
  }, [userId]);

  useEffect(() => {
    refetch();
  }, [page, refetch]);

  const handlePageChange = (e, value) => {
    setPage(value);
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    if (userId === authUser._id) {
      updateUserInfo();
    }
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
  const handleClearImage = () => {
    if (coverImg) {
      setCoverImg(null);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (!isLoading && userReviews && !userReviews.isLoading) {
      setUserName(user.username);
      setCoverImg(user.profileImg);
    }
  }, [isLoading]);

  return (
    <Paper className="p-2 my-4">
      {(isLoading || isPending || isUpdating) && (
        <Backdrop
          sx={{
            color: "#fff",
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
          open={true}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      )}
      {(isLoading || isPending) && (
        <Skeleton variant="rectengular" height={400} />
      )}
      {!isLoading && user && (
        <Box fullwidth className="mb-10">
          <Box className="flex flex-col w-full px-20 gap-4">
            <Box className="flex flex-col justify-between items-center w-full px-20 mt-10">
              {user.profileImg ? (
                <Avatar sx={{ width: 96, height: 96 }} src={user.profileImg} />
              ) : (
                <Avatar
                  sx={{
                    width: 96,
                    height: 96,
                    bgcolor: stringToColor(user.username),
                  }}
                >
                  {user.username.charAt(0)}
                </Avatar>
              )}
              <Box className="flex gap-2 justify-center items-center">
                <Typography fontSize={24} fontWeight={700}>
                  User: {user.username}
                </Typography>
                {authUser && userId === authUser._id && (
                  <IconButton onClick={handleOpen}>
                    <Edit color="disabled" />
                  </IconButton>
                )}
              </Box>
            </Box>
            <Box className="mt-4">
              <Typography fontSize={20} fontWeight={700}>
                About:
              </Typography>
              <Typography fontSize={18}>{user.about}</Typography>
            </Box>
            <Box className="flex justify-between items-center ">
              <Typography fontSize={18} color={"gray"}>
                Name:
              </Typography>
              <Typography fontSize={18}>{user.username}</Typography>
            </Box>
            <Divider />
            <Box className="flex justify-between items-center ">
              <Typography fontSize={18} color={"gray"}>
                Registered:
              </Typography>
              <Typography fontSize={18}>
                {dayjs(user.createdAt).format("MMMM D, YYYY h:mm A")}
              </Typography>
            </Box>
            <Divider />
            <Box className="flex justify-between items-center ">
              <Typography fontSize={18} color={"gray"}>
                User role:
              </Typography>
              <Typography fontSize={18}>
                {user.isModerator ? "Moderator" : "User"}
              </Typography>
            </Box>
            <Divider />
            <Box className="flex justify-between items-center ">
              <Typography fontSize={18} color={"gray"}>
                Number of comments:
              </Typography>
              <Typography fontSize={18}>{user.reviews.length}</Typography>
            </Box>

            <Divider />
            {userReviews &&
              userReviews.totalCount > 0 &&
              !(isLoading || isRefetching) && (
                <Box>
                  <Typography fontSize={20} fontWeight={700}>
                    Comments:
                  </Typography>
                  <Box>
                    {userReviews.pageData.map((review) => (
                      <Link
                        key={review._id}
                        to={
                          "/" +
                          (review.novel
                            ? "novel/" + review.novel
                            : "chapter/" + review.chapter)
                        }
                      >
                        <ReviewTile review={review} linksDisabled={true} />
                      </Link>
                    ))}
                    <Pagination
                      count={Math.ceil(
                        parseInt(userReviews.totalCount) / limit
                      )}
                      page={page}
                      onChange={handlePageChange}
                      shape="rounded"
                    />
                  </Box>
                </Box>
              )}
          </Box>
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box className="flex flex-col gap-4" sx={modalStyle}>
              <Typography variant="h6" component="h2">
                Edit Profile
              </Typography>
              {coverImg && (
                <Avatar
                  className="self-center"
                  sx={{ width: 150, height: 150 }}
                  src={coverImg}
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
                placeholder="Username"
                value={username}
                onChange={(e) => setUserName(e.target.value)}
                fullWidth
              />
              <Box className="flex flex-nowrap gap-4">
                <Button
                  variant="contained"
                  size="medium"
                  onClick={handleProfileUpdate}
                >
                  {isUpdating ? "Loading..." : "Update"}
                </Button>
                <Button variant="contained" size="medium" onClick={handleClose}>
                  Cancel
                </Button>
              </Box>
            </Box>
          </Modal>
        </Box>
      )}
      {isError && <Navigate to={"/404"} />}
    </Paper>
  );
};

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  height: 740,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default Profile;
