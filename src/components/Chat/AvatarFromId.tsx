import { DEFAULT_AVATAR, IMAGE_PROXY } from "../../shared/constants";

import { FC } from "react";
import Skeleton from "../Skeleton";
import { useUsersInfo } from "../../hooks/useUsersInfo";
import { Stack, Typography } from "@mui/material";

interface AvatarFromIdProps {
  uid: string;
  size?: number;
  showName?: boolean;
  afterTitle?: React.ReactNode;
  beforeTitle?: React.ReactNode;
}

const AvatarFromId: FC<AvatarFromIdProps> = ({
  uid,
  size = 30,
  afterTitle,
  showName,
}) => {
  const { data, loading, error } = useUsersInfo([uid]);

  if (loading)
    return (
      <Skeleton
        className="rounded-full"
        style={{ width: size, height: size }}
      ></Skeleton>
    );

  if (error)
    return (
      <Stack>
        <img
          src={DEFAULT_AVATAR}
          className="rounded-full"
          style={{ width: size, height: size }}
        />
      </Stack>
    );

  return (
    <Stack
      direction={"row"}
      justifyContent={"space-between"}
      alignItems={"center"}
    >
      <img
        title={data?.[0]?.data()?.displayName}
        style={{ width: size, height: size }}
        className="rounded-full object-cover"
        src={IMAGE_PROXY(data?.[0].data()?.photoURL)}
      ></img>
      <Stack justifyContent={"center"} alignItems={"center"}>
        {showName && <Typography>{data?.[0]?.data()?.displayName}</Typography>}
        {afterTitle}
      </Stack>
    </Stack>
  );
};

export default AvatarFromId;
