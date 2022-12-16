import { FC, Fragment, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import {
  formatDate,
  formatFileSize,
  splitLinkFromMessage,
} from "../../shared/utils";
import { EMOJI_REGEX, FIRESTORE_CONVERSATIONS_COLLECTION, FIRESTORE_MESSAGES_COLLECTION } from "../../shared/constants";
import FileIcon from "../FileIcon";
import ImageView from "../ImageView";
import { MessageItem } from "../../shared/types";
import ReactionPopup from "../Chat/ReactionPopup";
import ReactionStatus from "../Chat/ReactionStatus";
import ReplyBadge from "../Chat/ReplyBadge";
import ReplyIcon from "../Icon/ReplyIcon";
import SpriteRenderer from "../SpriteRenderer";
import { firestore } from "../../shared/firebase";
import { useParams } from "react-router-dom";
import { useAppSelector } from "../../redux/hooks";
import { ClickAwayListener } from "@mui/material";

interface RightMessageProps {
  message: MessageItem;
  replyInfo: any;
  setReplyInfo: (value: any) => void;
}

const RightMessage: FC<RightMessageProps> = ({ message, setReplyInfo }) => {
  const [isSelectReactionOpened, setIsSelectReactionOpened] = useState(false);

  const { id: conversationId } = useParams();

  const { currentUser } = useAppSelector((state) => state.users);

  const [isImageViewOpened, setIsImageViewOpened] = useState(false);

  const removeMessage = (messageId: string) => {
    updateDoc(
      doc(
        firestore,
        FIRESTORE_CONVERSATIONS_COLLECTION,
        conversationId as string,
        FIRESTORE_MESSAGES_COLLECTION,
        messageId
      ),
      {
        type: "removed",
        file: null,
        reactions: [],
      }
    );
  };

  const formattedDate = formatDate(message.createdAt);

  return (
    <div id={`message-${message.id}`}>
      <div className="-mb-2 flex justify-end">
        {!!message.replyTo && (
          <ReplyBadge messageId={message.replyTo as string} />
        )}
      </div>
      <div
        onClick={(e) => {
          if (e.detail === 2 && message.type !== "removed") {
            setReplyInfo(message);
          }
        }}
        className={`group relative flex flex-row-reverse items-stretch gap-2 ${
          Object.keys(message.reactions || {}).length > 0 ? "mb-2" : ""
        }`}
      >
        {message.type === "text" ? (
          <>
            {EMOJI_REGEX.test(message.content) ? (
              <div
                onClick={(e) => e.stopPropagation()}
                title={formattedDate}
                className="text-4xl"
              >
                {message.content}
              </div>
            ) : (
              <div
                onClick={(e) => e.stopPropagation()}
                title={formattedDate}
                className={`relative rounded-lg bg-primary p-2 text-white after:absolute after:left-full after:bottom-[6px] after:border-8 after:border-primary after:border-t-transparent after:border-r-transparent`}
                style={{
                  wordBreak: "break-all",
                }}
                dangerouslySetInnerHTML={{
                  __html: splitLinkFromMessage(message.content || ""),
                }}
              ></div>
            )}
          </>
        ) : message.type === "image" ? (
          <>
            <img
              onClick={(e) => {
                setIsImageViewOpened(true);
                e.stopPropagation();
              }}
              title={formattedDate}
              className="max-w-[60%] cursor-pointer transition duration-300 hover:brightness-[85%]"
              src={message.content}
              alt=""
            />
            <ImageView
              src={message.content}
              isOpened={isImageViewOpened}
              setIsOpened={setIsImageViewOpened}
            />
          </>
        ) : message.type === "file" ? (
          <div
            onClick={(e) => e.stopPropagation()}
            title={formattedDate}
            className="flex items-center gap-2 overflow-hidden rounded-lg bg-dark-lighten py-3 px-5"
          >
            <FileIcon
              className="h-4 w-4 object-cover"
              extension={message.file?.name.split(".").slice(-1)[0] as string}
            />
            <div>
              <p className="max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap">
                {message.file?.name}
              </p>

              <p className="text-sm text-gray-400">
                {formatFileSize(message.file?.size as number)}
              </p>
            </div>

            <a
              href={message.content}
              download
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="bx bxs-download text-2xl"></i>
            </a>
          </div>
        ) : message.type === "sticker" ? (
          <SpriteRenderer
            onClick={(e) => e.stopPropagation()}
            title={formattedDate}
            src={message.content}
            size={130}
          />
        ) : (
          <div
            onClick={(e) => e.stopPropagation()}
            title={formattedDate}
            className="rounded-lg border border-dark-lighten p-3 text-gray-400"
          >
            Message has been removed
          </div>
        )}

        {message.type !== "removed" && (
          <>
            <button
              onClick={() => setIsSelectReactionOpened(true)}
              className="text-lg text-gray-500 opacity-0 transition hover:text-gray-300 group-hover:opacity-100"
            >
              <i className="bx bx-smile"></i>
            </button>

            <button
              onClick={(e) => {
                setReplyInfo(message);
                e.stopPropagation();
              }}
              className="text-gray-500 opacity-0 transition hover:text-gray-300 group-hover:opacity-100"
            >
              <ReplyIcon />
            </button>
            {/* 
            <button
              onClick={(e) => {
                removeMessage(message.id as string);
                e.stopPropagation();
              }}
              className="text-lg text-gray-500 opacity-0 transition hover:text-gray-300 group-hover:opacity-100"
            >
              <i className="bx bxs-trash"></i>
            </button> */}

            {isSelectReactionOpened && (
              <ClickAwayListener
                onClickAway={() => setIsSelectReactionOpened(false)}
              >
                <ReactionPopup
                  position="right"
                  setIsOpened={setIsSelectReactionOpened}
                  messageId={message.id as string}
                  currentReaction={
                    message.reactions?.[currentUser?.uid as string] || 0
                  }
                />
              </ClickAwayListener>
            )}

            {Object.keys(message.reactions || {}).length > 0 && (
              <ReactionStatus message={message} position="right" />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RightMessage;
