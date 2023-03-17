import { FC, useState } from "react";

import Alert from "../Alert";
import { firestore } from "../../shared/firebase";
import { doc } from "firebase/firestore";
import { useDocumentQuery } from "../../hooks/useDocumentQuery";
import { useParams } from "react-router-dom";
import {
  FIRESTORE_CONVERSATIONS_COLLECTION,
  FIRESTORE_MESSAGES_COLLECTION,
} from "../../shared/constants";

interface ReplyBadgeProps {
  messageId: string;
}

const ReplyBadge: FC<ReplyBadgeProps> = ({ messageId }) => {
  const { id: conversationId } = useParams();

  const [isAlertOpened, setIsAlertOpened] = useState(false);

  const { data, loading, error } = useDocumentQuery(
    `message-${messageId}`,
    doc(
      firestore,
      FIRESTORE_CONVERSATIONS_COLLECTION,
      conversationId as string,

      FIRESTORE_MESSAGES_COLLECTION,
      messageId
    )
  );

  if (loading || error)
    return <div className="h-10 w-20 rounded-lg bg-[#4E4F50]"></div>;

  return (
    <>
      <div
        onClick={() => {
          const el = document.querySelector(`#message-${messageId}`);
          if (el) el.scrollIntoView({ behavior: "smooth" });
          else setIsAlertOpened(true);
        }}
        className="cursor-pointer rounded-lg bg-[#4E4F50] p-2 opacity-60"
        style={{
          wordBreak: "break-all",
        }}
      >
        {data?.data()?.type === "text" ? (
          <p>{data?.data()?.content}</p>
        ) : data?.data()?.type === "image" ? (
          "An image"
        ) : data?.data()?.type === "file" ? (
          "A file"
        ) : data?.data()?.type === "sticker" ? (
          "A sticker"
        ) : (
          "Message has been removed"
        )}
      </div>
      <Alert
        isOpened={isAlertOpened}
        setIsOpened={setIsAlertOpened}
        text="Cannot find your message. Try to scroll up to load more"
      />
    </>
  );
};

export default ReplyBadge;
