import { useQuery } from "@tanstack/react-query";
import { Outlet, Navigate } from "react-router-dom";

const AnonymousRoute = () => {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  return authUser ? <Navigate to="/" replace /> : <Outlet />;
};

export default AnonymousRoute;
