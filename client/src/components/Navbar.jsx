import { NavLink, Link } from "react-router-dom";
import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  Container,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
} from "@mui/material";

import { Logout, Bookmark, AccountCircle } from "@mui/icons-material";

import SearchBar from "@mkyy/mui-search-bar";

const Navbar = () => {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const [searchData, setSearchData] = useState("");

  const handleSearchRequest = () => {
    if (searchData.length !== 0) {
      console.log("Test", searchData);
    }
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const queryClient = useQueryClient();
  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/auth/logout", {
          method: "POST",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success("Successfully logged out");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: () => {
      toast.error("Logout failed");
    },
  });

  return (
    <Box className="py-2.5 bg-white border">
      <Container maxWidth="lg">
        <Box className="flex justify-between flex-nowrap">
          <Box className="flex flex-none gap-10">
            <NavLink to="/">
              <Typography fontWeight={700} fontSize={25}>
                The Novels
              </Typography>
            </NavLink>
            <SearchBar
              className="border"
              value={searchData}
              onChange={(newValue) => setSearchData(newValue)}
              onSearch={handleSearchRequest}
            />
          </Box>

          <Box className="flex-none">
            {authUser ? (
              <Box>
                {authUser.isModerator && (
                  <Button
                    variant="contained"
                    component={Link}
                    to="/add-novel"
                    sx={{ mr: 4 }}
                  >
                    Add a novel
                  </Button>
                )}
                <IconButton
                  onClick={handleMenu}
                  size="small"
                  sx={{ ml: 2 }}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                >
                  <Avatar sx={{ width: 32, height: 32 }}>M</Avatar>
                </IconButton>
                <Menu
                  id="account_menu"
                  anchorEl={() => anchorEl}
                  keepMounted
                  open={open}
                  onClose={handleClose}
                  PaperProps={{
                    elevation: 0,
                    sx: {
                      overflow: "visible",
                      filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                      mt: 1.5,
                      "& .MuiAvatar-root": {
                        width: 32,
                        height: 32,
                        ml: -0.5,
                        mr: 1,
                      },
                      "&::before": {
                        content: '""',
                        display: "block",
                        position: "absolute",
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: "background.paper",
                        transform: "translateY(-50%) rotate(45deg)",
                        zIndex: 0,
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                >
                  <MenuItem
                    component={Link}
                    to={"/profile/" + authUser._id}
                    onClick={handleClose}
                  >
                    <ListItemIcon>
                      <AccountCircle sx={{ height: 30, width: 30 }} />
                    </ListItemIcon>
                    <ListItemText>Profile</ListItemText>
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    onClick={handleClose}
                    component={Link}
                    to={"/saved/" + authUser._id}
                  >
                    <ListItemIcon>
                      <Bookmark sx={{ height: 30, width: 30 }} />
                    </ListItemIcon>
                    <ListItemText>Saved</ListItemText>
                  </MenuItem>
                  {/* <MenuItem onClick={handleClose}>
                    <ListItemIcon>
                      <Sms sx={{ height: 30, width: 30 }} />
                    </ListItemIcon>
                    <ListItemText>Reviews</ListItemText>
                  </MenuItem> */}
                  <Divider />
                  <MenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      logout();
                      handleClose();
                    }}
                  >
                    <ListItemIcon>
                      <Logout sx={{ height: 30, width: 30 }} />
                    </ListItemIcon>
                    <ListItemText>Logout</ListItemText>
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Box>
                <Link className="ml-2.5" to="/login">
                  <Button variant="outlined">Login</Button>
                </Link>
                <Link className="ml-2.5" to="/register">
                  <Button variant="contained">Sing up</Button>
                </Link>
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Navbar;
