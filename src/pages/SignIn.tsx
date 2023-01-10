import {
  signInWithEmailAndPassword,
  } from "firebase/auth";
import { FC, useCallback, useState } from "react";
import Alert from "../components/Alert";
import { Navigate } from "react-router-dom";
import { auth } from "../shared/firebase";
import { useQueryParams } from "../hooks/useQueryParams";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { Box, TextField } from "@mui/material";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { useForm } from "react-hook-form";
import {
  setCurrentUserId,
  UsersSliceStateType,
} from "../redux/common/reducers/UsersSlice";

const SignIn: FC = () => {
  const { redirect } = useQueryParams();

  const { currentUser } = useAppSelector<UsersSliceStateType>(
    (state) => state.users
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAlertOpened, setIsAlertOpened] = useState(false);
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const dispatch = useAppDispatch();

  const emailPasswordLogin = useCallback(() => {
    handleSubmit(async ({ email, password }) => {
      signInWithEmailAndPassword(auth, email, password).then(async (result) => {
        dispatch(setCurrentUserId(result.user.uid));
      });
    })();
  }, []);

  if (currentUser) return <Navigate to={redirect || "/"} />;

  return (
    <>
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <img className="h-8 w-8" src="/icon.svg" alt="" />
            <span className="text-2xl"></span>
          </div>
        </div>
        <Stack direction={"column"} gap={1}>
          <TextField
            sx={{
              background: "white",
            }}
            placeholder={"email"}
            {...register("email", {
              required: true,
            })}
          />
          <TextField
            sx={{
              background: "white",
            }}
            placeholder={"password"}
            type={"password"}
            {...register("password", {
              required: true,
            })}
          />
          <Button onClick={emailPasswordLogin} variant="contained">
            Sign in
          </Button>
        </Stack>
        {/* <div className="flex items-center justify-center">
          <button
            disabled={loading}
            onClick={() => handleSignIn(new GoogleAuthProvider())}
            className="flex min-w-[250px] cursor-pointer items-center items-center justify-center gap-3 rounded-md bg-white p-3 text-black transition duration-300 hover:brightness-90 disabled:!cursor-default disabled:!brightness-75"
          >
            <img className="h-6 w-6" src="/google.svg" alt="" />

            <span>Sign In With Google</span>
          </button>
        </div> */}
      </div>

      <Alert
        isOpened={isAlertOpened}
        setIsOpened={setIsAlertOpened}
        text={error}
        isError
      />
    </>
  );
};

export default SignIn;
