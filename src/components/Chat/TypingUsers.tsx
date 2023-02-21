import { useMemo } from "react";
import { useUsersInfo } from "../../hooks/useUsersInfo";
import { useParams } from "react-router-dom";
import { UsersSliceStateType } from "../../redux/common/reducers/UsersSlice";
import { useAppSelector } from "../../redux/hooks";
import { ConversationsSliceStateType } from "../../redux/common/reducers/ConversationsSlice";
import { ConversationInfo } from "../../shared/types";
import { Box, Collapse, Fade, Slide } from "@mui/material";

interface TypingUsersProps {
  conversation: ConversationInfo;
}
export default function TypingUsers({ conversation }: TypingUsersProps) {
  const { data: users } = useUsersInfo(conversation.users);
  const { id: conversationId } = useParams();
  const { currentUser } = useAppSelector<UsersSliceStateType>(
    (state) => state.users
  );
  const { listeners } = useAppSelector<ConversationsSliceStateType>(
    (state) => state.conversations
  );

  const filteredTypingUsers = useMemo(() => {
    let tempFilteredTypingUsers = users?.filter(
      (user) =>
        user?.id !== currentUser?.uid &&
        listeners?.[conversationId as string]?.isTyping?.[user?.id]
    );
    return tempFilteredTypingUsers || [];
  }, [listeners?.[conversationId as string]?.isTyping, currentUser?.uid]);

  return (
    <Collapse in={filteredTypingUsers.length > 0} unmountOnExit mountOnEnter>
      <div className="typing-container">
        {filteredTypingUsers
          ?.slice(0, 3)
          ?.map((user) => user.data()?.displayName)
          ?.join(", ")}
        <Fade in={filteredTypingUsers.length > 3} unmountOnExit mountOnEnter>
          <Box component={"span"}>
            {" "}
            & {filteredTypingUsers?.length - 3} others
          </Box>
        </Fade>
        <Fade in={filteredTypingUsers.length > 0} unmountOnExit mountOnEnter>
          <Box component={"span"}>
            {" "}
            is typing
            <div className="typing is-typing-active">
              <span className="typing__bullet"></span>
              <span className="typing__bullet"></span>
              <span className="typing__bullet"></span>
            </div>
          </Box>
        </Fade>
      </div>
    </Collapse>
  );
}
