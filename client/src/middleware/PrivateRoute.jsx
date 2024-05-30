import { useQuery } from "@tanstack/react-query";
import { Outlet, Navigate } from "react-router-dom";

const PrivateRoute = () => {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  return authUser ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
