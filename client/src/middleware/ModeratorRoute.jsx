import { useQuery } from "@tanstack/react-query";
import { Outlet, Navigate } from "react-router-dom";

const ModeratorRoute = () => {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  return authUser.isModerator ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ModeratorRoute;
