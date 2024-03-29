import { FC, useState, useMemo } from "react";

import { ConversationInfo } from "../../shared/types";
import ConversationSettings from "./ConversationSettings";
import { IMAGE_PROXY } from "../../shared/constants";
import { Link } from "react-router-dom";
import Skeleton from "../Skeleton";
import ViewGroup from "../Group/ViewGroup";
import ViewMedia from "../Media/ViewMedia";
import { useUsersInfo } from "../../hooks/useUsersInfo";
import { useAppSelector } from "../../redux/hooks";
import { UsersSliceStateType } from "../../redux/common/reducers/UsersSlice";
import { Stack } from "@mui/material";
import { ConversationsSliceStateType } from "../../redux/common/reducers/ConversationsSlice";
import moment from "moment";

interface ChatHeaderProps {
  conversation: ConversationInfo;
}

const ChatHeader: FC<ChatHeaderProps> = ({ conversation }) => {
  const { data: users, loading } = useUsersInfo(conversation.users);
  const { currentUser } = useAppSelector<UsersSliceStateType>(
    (state) => state.users
  );
  const { listeners } = useAppSelector<ConversationsSliceStateType>(
    (state) => state.conversations
  );

  const filtered = useMemo(() => {
    return users?.filter((user) => user.id !== currentUser?.uid);
  }, [users, currentUser?.uid]);

  const [isConversationSettingsOpened, setIsConversationSettingsOpened] =
    useState(false);
  const [isGroupMembersOpened, setIsGroupMembersOpened] = useState(false);
  const [isViewMediaOpened, setIsViewMediaOpened] = useState(false);

  return (
    <>
      <div className="border-dark-lighten flex h-20 items-center justify-between border-b px-5">
        <div className="flex flex-grow items-center gap-3">
          <Link to="/" className="md:hidden">
            <i className="bx bxs-chevron-left text-primary text-3xl"></i>
          </Link>
          {loading ? (
            <Skeleton className="h-10 w-10 rounded-full" />
          ) : (
            <>
              {conversation.users.length === 2 ? (
                <img
                  className="h-10 w-10 rounded-full object-cover"
                  src={IMAGE_PROXY(filtered?.[0]?.data()?.photoURL)}
                  alt=""
                />
              ) : (
                <>
                  {conversation?.group?.groupImage ? (
                    <img
                      className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                      src={conversation.group.groupImage}
                      alt=""
                    />
                  ) : (
                    <div className="relative h-10 w-10 flex-shrink-0">
                      <img
                        className="absolute top-0 right-0 h-7 w-7 flex-shrink-0 rounded-full object-cover"
                        src={IMAGE_PROXY(filtered?.[0]?.data()?.photoURL)}
                        alt=""
                      />
                      <img
                        className={`border-dark absolute bottom-0 left-0 z-[1] h-7 w-7 flex-shrink-0 rounded-full border-2 object-cover transition duration-300`}
                        src={IMAGE_PROXY(filtered?.[1]?.data()?.photoURL)}
                        alt=""
                      />
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {loading ? (
            <Skeleton className="h-6 w-1/4" />
          ) : (
            <Stack alignItems={"flex-start"} justifyContent={"center"}>
              <p>
                {conversation.users.length > 2 && conversation?.group?.groupName
                  ? conversation.group.groupName
                  : filtered
                      ?.map((user) => user.data()?.displayName)
                      .slice(0, 3)
                      .join(", ")}
              </p>
              {conversation.users.length === 2 &&
                filtered?.[0]?.id &&
                listeners?.[filtered?.[0]?.id]?.status === "online" && (
                  <p
                    style={{
                      fontSize: "10px",
                    }}
                  >
                    Online
                  </p>
                )}
              {conversation.users.length === 2 &&
                filtered?.[0]?.id &&
                listeners?.[filtered?.[0]?.id]?.status !== "online" && (
                  <p
                    style={{
                      fontSize: "10px",
                    }}
                  >
                    Last seen at {moment(listeners?.[filtered?.[0]?.id]?.lastSeen).fromNow()}
                  </p>
                )}
            </Stack>
          )}
        </div>

        {!loading && (
          <>
            {conversation.users.length > 2 && (
              <button onClick={() => setIsGroupMembersOpened(true)}>
                <i className="bx bxs-group text-primary text-2xl"></i>
              </button>
            )}

            <button onClick={() => setIsConversationSettingsOpened(true)}>
              <i className="bx bxs-info-circle text-primary text-2xl"></i>
            </button>
          </>
        )}
      </div>

      {isConversationSettingsOpened && (
        <ConversationSettings
          setIsOpened={setIsConversationSettingsOpened}
          conversation={conversation}
          setMediaViewOpened={setIsViewMediaOpened}
        />
      )}

      {isGroupMembersOpened && (
        <ViewGroup
          setIsOpened={setIsGroupMembersOpened}
          conversation={conversation}
        />
      )}
      {isViewMediaOpened && <ViewMedia setIsOpened={setIsViewMediaOpened} />}
    </>
  );
};

export default ChatHeader;
