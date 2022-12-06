import { Navigate, useLocation } from "react-router-dom";
import { FC } from "react";
import { useAppSelector } from "../redux/hooks";
import { UsersSliceStateType } from "../redux/common/reducers/UsersSlice";

const PrivateRoute: FC = ({ children }) => {
  const { currentUser } = useAppSelector<UsersSliceStateType>(
    (state) => state.users
  );
  const location = useLocation();

  if (!currentUser)
    return (
      <Navigate
        to={`/sign-in?redirect=${encodeURIComponent(
          location.pathname + location.search
        )}`}
      />
    );

  return <>{children}</>;
};

export default PrivateRoute;
