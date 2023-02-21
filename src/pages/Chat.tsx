import { FC, useEffect, useState, useMemo } from "react";

import ChatHeader from "../components/Chat/ChatHeader";
import ChatView from "../components/Chat/ChatView";
import { ConversationInfo } from "../shared/types";
import InputSection from "../components/Input/InputSection";
import SideBar from "../components/Home/SideBar";
import { database, firestore } from "../shared/firebase";
import { doc } from "firebase/firestore";
import { useDocumentQuery } from "../hooks/useDocumentQuery";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { UsersSliceStateType } from "../redux/common/reducers/UsersSlice";
import { FIRESTORE_CONVERSATIONS_COLLECTION } from "../shared/constants";
import {
  getConversationReference,
  getUserDatabaseReference,
} from "../shared/helpers";
import { onValue, ref } from "firebase/database";
import {
  ConversationsSliceStateType,
  UpdateListeners,
} from "../redux/common/reducers/ConversationsSlice";
import { Button } from "@mui/material";

const Chat: FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useDocumentQuery(
    `conversation-${id}`,
    doc(firestore, FIRESTORE_CONVERSATIONS_COLLECTION, id as string)
  );

  const conversation = data?.data() as ConversationInfo;

  const { currentUser } = useAppSelector<UsersSliceStateType>(
    (state) => state.users
  );
  const { listeners } = useAppSelector<ConversationsSliceStateType>(
    (state) => state.conversations
  );

  const [inputSectionOffset, setInputSectionOffset] = useState(0);
  const dispatch = useAppDispatch();

  const [replyInfo, setReplyInfo] = useState(null);

  const usersOfThisConversation = useMemo(() => {
    return conversation?.users?.filter((user) => {
      return user !== currentUser?.uid;
    });
  }, [JSON.stringify(conversation?.users)]);

  //listener
  useEffect(() => {
    if (!usersOfThisConversation || !id) {
      return;
    }
    let unSubUser = () => {};
    let unSubConvo = () => {};
    if (conversation?.users.length <= 2) {
      let userId = usersOfThisConversation[0];

      //user listener
      if (!listeners?.[userId]) {
        let reference = ref(database, getUserDatabaseReference(userId));
        unSubUser = onValue(reference, (snapShot) => {
          dispatch(UpdateListeners({ id: userId, data: snapShot.val() }));
        });
      }
    }
    //conversation listener
    if (!listeners?.[id]) {
      let convoReference = ref(database, getConversationReference(id));

      unSubConvo = onValue(convoReference, (snapShot) => {
        dispatch(UpdateListeners({ id: id, data: snapShot.val() }));
      });
    }

    return () => {
      unSubUser();
      unSubConvo();
    };
  }, [JSON.stringify(usersOfThisConversation), id]);

  useEffect(() => {
    if (conversation?.theme)
      document.body.style.setProperty("--primary-color", conversation.theme);
  }, [conversation?.theme || ""]);

  return (
    <div className="flex">
      <SideBar />

      <div className="flex h-screen flex-grow flex-col items-stretch">
        {loading ? (
          <>
            <div className="border-dark-lighten h-20 border-b"></div>
            <div className="flex-grow"></div>
            <InputSection disabled />
          </>
        ) : !conversation ||
          error ||
          !conversation.users.includes(currentUser?.uid as string) ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-6">
            <img className="h-32 w-32 object-cover" src="/error.svg" alt="" />
            <p className="text-center text-lg">Conversation does not exists</p>
            <Button onClick={() => navigate("/")}>Go to home</Button>
          </div>
        ) : (
          <>
            <ChatHeader conversation={conversation} />
            <ChatView
              replyInfo={replyInfo}
              setReplyInfo={setReplyInfo}
              inputSectionOffset={inputSectionOffset}
              conversation={conversation}
            />
            <InputSection
              setInputSectionOffset={setInputSectionOffset}
              replyInfo={replyInfo}
              setReplyInfo={setReplyInfo}
              disabled={false}
              isClosed={conversation.isClosed}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
