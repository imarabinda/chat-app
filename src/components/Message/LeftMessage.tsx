import { ConversationInfo, MessageItem } from "../../shared/types";
import { FC, Fragment, useState } from "react";
import {
  formatDate,
  formatFileSize,
  splitLinkFromMessage,
} from "../../shared/utils";

import AvatarFromId from "../Chat/AvatarFromId";
import { EMOJI_REGEX } from "../../shared/constants";
import FileIcon from "../FileIcon";
import ImageView from "../ImageView";
import ReactionPopup from "../Chat/ReactionPopup";
import ReactionStatus from "../Chat/ReactionStatus";
import ReplyBadge from "../Chat/ReplyBadge";
import ReplyIcon from "../Icon/ReplyIcon";
import SpriteRenderer from "../SpriteRenderer";
import { useAppSelector } from "../../redux/hooks";
import { ClickAwayListener, Divider } from "@mui/material";
import { UsersSliceStateType } from "../../redux/common/reducers/UsersSlice";

interface LeftMessageProps {
  message: MessageItem;
  conversation: ConversationInfo;
  replyInfo: any;
  setReplyInfo: (value: any) => void;
}

const LeftMessage: FC<LeftMessageProps> = ({
  message,
  conversation,
  setReplyInfo,
}) => {
  const [isSelectReactionOpened, setIsSelectReactionOpened] = useState(false);
  const { currentUser } = useAppSelector<UsersSliceStateType>(
    (state) => state.users
  );

  const [isImageViewOpened, setIsImageViewOpened] = useState(false);

  const formattedDate = formatDate(message.createdAt);

  return (
    <div id={`message-${message.id}`}>
      <div
        className={`${conversation.users.length === 2 ? "" : ""} -mb-2 flex`}
      >
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
        className={`group relative flex items-stretch gap-2 ${
          Object.keys(message.reactions || {}).length > 0 ? "mb-2" : ""
        }`}
      >
        {conversation.users.length > 2 && (
          <div onClick={(e) => e.stopPropagation()} className="h-full py-1">
            <div className="h-[30px] w-[30px]">
              <AvatarFromId uid={message.sender} />
            </div>
          </div>
        )}

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
                className={`rounded-lg bg-dark-lighten p-2 text-white ${
                  conversation.users.length === 2
                    ? "relative after:absolute after:right-full after:bottom-[6px] after:border-8 after:border-dark-lighten after:border-t-transparent after:border-l-transparent"
                    : ""
                }`}
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
            style={{
              wordBreak: "break-all",
            }}
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

            {isSelectReactionOpened && (
              <ClickAwayListener
                onClickAway={() => setIsSelectReactionOpened(false)}
              >
                <ReactionPopup
                  position={"left"}
                  setIsOpened={setIsSelectReactionOpened}
                  messageId={message.id as string}
                  currentReaction={
                    message.reactions?.[currentUser?.uid as string] || 0
                  }
                />
              </ClickAwayListener>
            )}
          </>
        )}
        {Object.keys(message.reactions || {}).length > 0 && (
          <ReactionStatus
            message={message}
            position={conversation.users.length > 2 ? "left-tab" : "left"}
          />
        )}
      </div>
    </div>
  );
};

export default LeftMessage;
