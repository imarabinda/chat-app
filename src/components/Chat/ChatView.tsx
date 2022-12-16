import { ConversationInfo, MessageItem } from "../../shared/types";
import { FC, Fragment, useEffect, useRef, useState, useMemo } from "react";
import {
  collection,
  doc,
  limitToLast,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

import AvatarFromId from "./AvatarFromId";
import InfiniteScroll from "react-infinite-scroll-component";
import LeftMessage from "../Message/LeftMessage";
import RightMessage from "../Message/RightMessage";
import Spin from "react-cssfx-loading/src/Spin";
import { firestore } from "../../shared/firebase";
import { useCollectionQuery } from "../../hooks/useCollectionQuery";
import { useParams } from "react-router-dom";
import { useAppSelector } from "../../redux/hooks";
import { generateItems, getUtcTime } from "../../shared/helpers";
import { formatDate } from "../../shared/utils";
import { FIRESTORE_CONVERSATIONS_COLLECTION, FIRESTORE_MESSAGES_COLLECTION, MESSAGE_STACK_BY_TIME_DIFFERENCE } from "../../shared/constants";
import { DateGroup } from "../Message/DateGroup";
import {
  Box,
  ClickAwayListener,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import { UsersSliceStateType } from "../../redux/common/reducers/UsersSlice";

interface ChatViewProps {
  conversation: ConversationInfo;
  inputSectionOffset: number;
  replyInfo: any;
  setReplyInfo: (value: any) => void;
}
const MessageSeenBar = styled(Stack)`
  position: relative;
`;
const MessageSeenTooltip = styled(Stack)`
  max-height: 20rem;
  max-width: 13rem;
  width: 100vw;
  background-color: rgb(36, 37, 38, 1);
  position: absolute;
  bottom: calc(100% + 10px);
  border-radius: 10px;
  padding: 1rem;
  box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
`;

const ChatView: FC<ChatViewProps> = ({
  conversation,
  inputSectionOffset,
  replyInfo,
  setReplyInfo,
}) => {
  const { id: conversationId } = useParams();

  const { currentUser } = useAppSelector<UsersSliceStateType>(
    (state) => state.users
  );

  const scrollBottomRef = useRef<HTMLDivElement>(null);

  const [limitCount, setLimitCount] = useState(30);

  const { data, loading, error } = useCollectionQuery(
    `conversation-data-${conversationId}-${limitCount}`,
    query(
      collection(
        firestore,
        FIRESTORE_CONVERSATIONS_COLLECTION,
        conversationId as string,
        FIRESTORE_MESSAGES_COLLECTION
      ),
      orderBy("createdAt"),
      limitToLast(limitCount)
    )
  );

  const dataRef = useRef(data);
  const conversationIdRef = useRef(conversationId);
  const isWindowFocus = useRef(true);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    if (isWindowFocus.current) updateSeenStatus();

    scrollBottomRef.current?.scrollIntoView();

    setTimeout(() => {
      scrollBottomRef.current?.scrollIntoView();
    }, 100);
  }, [data?.docs?.slice(-1)?.[0]?.id || ""]);

  const updateSeenStatus = () => {
    if (dataRef.current?.empty) return;

    const lastDoc = dataRef.current?.docs?.slice(-1)?.[0];

    if (!lastDoc) return;

    updateDoc(
      doc(firestore, FIRESTORE_CONVERSATIONS_COLLECTION, conversationIdRef.current as string),
      {
        [`seen.${currentUser?.uid}`]: {
          messageId: lastDoc.id,
          seenAt: getUtcTime(),
        },
      }
    );
  };

  useEffect(() => {
    const focusHandler = () => {
      isWindowFocus.current = true;

      updateSeenStatus();
    };

    const blurHandler = () => {
      isWindowFocus.current = false;
    };

    addEventListener("focus", focusHandler);
    addEventListener("blur", blurHandler);

    return () => {
      removeEventListener("focus", focusHandler);
      removeEventListener("blur", blurHandler);
    };
  }, []);

  const [showToolTip, setShowToolTip] = useState<{ [key: string]: boolean }>(
    {}
  );
  const setToolTipData = (id: string) => () => {
    const data: {
      [key: string]: boolean;
    } = {
      ...showToolTip,
    };
    data[id] = true;
    setShowToolTip(data);
  };
  const unsetToolTipData = (id: string) => () => {
    const data: {
      [key: string]: boolean;
    } = {
      ...showToolTip,
    };

    data[id] = false;
    setShowToolTip(data);
  };

  const filteredDocs = useMemo(() => {
    if (!data?.docs) {
      return [];
    }
    return generateItems(data?.docs);
  }, [data?.docs]);

  if (loading)
    return (
      <div className="flex flex-grow items-center justify-center">
        <Spin />
      </div>
    );

  if (error)
    return (
      <div className="flex-grow">
        <p className="mt-4 text-center text-gray-400">Something went wrong</p>
      </div>
    );

  if (filteredDocs.length === 0) {
    return (
      <div className="flex-grow">
        <p className="mt-4 text-center text-gray-400">
          No message recently. Start chatting now.
        </p>
      </div>
    );
  }

  return (
    <InfiniteScroll
      dataLength={data?.size as number}
      next={() => setLimitCount((prev) => prev + 10)}
      inverse
      hasMore={(data?.size as number) >= limitCount}
      loader={
        <div className="flex justify-center py-3">
          <Spin />
        </div>
      }
      style={{ display: "flex", flexDirection: "column-reverse" }}
      height={`calc(100vh - ${144 + inputSectionOffset}px)`}
    >
      <div className="flex flex-col items-stretch gap-3 px-8 pt-10 pb-1">
        {filteredDocs.map((item: MessageItem, index: number) => {
          // const formattedDate = formatMessageTime(
          //   item?.createdAt ? item?.createdAt : Date.now()
          // );

          // let addNewItem = false;
          // if (filteredDocs?.[index - 1]?.sender !== item?.sender) {
          //   addNewItem = true;
          // }
          // if (
          //   item?.createdAt - filteredDocs?.[index - 1]?.createdAt >
          //   MESSAGE_STACK_BY_TIME_DIFFERENCE
          // ) {
          //   addNewItem = true;
          // }

          const messageSeen = Object.entries(conversation?.seen || {}).filter(
            ([key, value]) =>
              key !== currentUser?.uid && value?.messageId == item?.id
          );

          return (
            <Fragment key={item?.id}>
              {item?.sender === currentUser?.uid ? (
                <RightMessage
                  replyInfo={replyInfo}
                  setReplyInfo={setReplyInfo}
                  message={item}
                />
              ) : item?.type == "day" ? (
                <DateGroup item={item} />
              ) : (
                <LeftMessage
                  replyInfo={replyInfo}
                  setReplyInfo={setReplyInfo}
                  message={item}
                  conversation={conversation}
                />
              )}

              {messageSeen?.length > 0 && (
                <MessageSeenBar
                  justifyContent={"flex-end"}
                  alignItems={"center"}
                  direction={"row"}
                >
                  {item?.id && showToolTip?.[item.id] && (
                    <ClickAwayListener onClickAway={unsetToolTipData(item.id)}>
                      <MessageSeenTooltip>
                        <Typography className="seen-count">Read By</Typography>
                        <div className="seen-by">
                          {messageSeen.map(([key, value]) => {
                            return (
                              <AvatarFromId
                                key={key}
                                uid={key}
                                size={30}
                                showName={true}
                                afterTitle={formatDate(value?.seenAt)}
                              />
                            );
                          })}
                        </div>
                      </MessageSeenTooltip>
                    </ClickAwayListener>
                  )}

                  {item?.id && (
                    <div
                      className="message-seen-icons"
                      onClick={setToolTipData(item?.id)}
                    >
                      {messageSeen.slice(0, 3).map(([key, value]) => {
                        const title = `Seen at ${formatDate(value?.seenAt)}`;

                        return <AvatarFromId key={key} uid={key} size={14} />;
                      })}
                      {messageSeen.length > 3 && (
                        <p className="extra-user-counter">
                          + {messageSeen.length - 3}
                        </p>
                      )}
                    </div>
                  )}
                </MessageSeenBar>
              )}
            </Fragment>
          );
        })}
        <div ref={scrollBottomRef}></div>
      </div>
    </InfiniteScroll>
  );
};

export default ChatView;
