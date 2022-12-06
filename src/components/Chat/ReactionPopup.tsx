import { FC, Ref } from "react";
import { deleteField, doc, updateDoc } from "firebase/firestore";

import { FIRESTORE_CONVERSATIONS_COLLECTION, FIRESTORE_MESSAGES_COLLECTION, REACTIONS_UI } from "../../shared/constants";
import { firestore } from "../../shared/firebase";
import { useParams } from "react-router-dom";
import { useAppSelector } from "../../redux/hooks";
import { UsersSliceStateType } from "../../redux/common/reducers/UsersSlice";

interface ReactionPopupProps {
  position: "left" | "right";
  setIsOpened: (value: boolean) => void;
  messageId: string;
  currentReaction: number;
}

const ReactionPopup: FC<ReactionPopupProps> = ({
  position,
  setIsOpened,
  messageId,
  currentReaction,
}) => {
  const { id: conversationId } = useParams();

  const { currentUser } = useAppSelector<UsersSliceStateType>(
    (state) => state.users
  );

  const updateReaction = (value: number) => {
    updateDoc(
      doc(
        firestore,
        FIRESTORE_CONVERSATIONS_COLLECTION,
        conversationId as string,
        FIRESTORE_MESSAGES_COLLECTION,
        messageId
      ),
      {
        [`reactions.${currentUser?.uid}`]: value == 0 ? deleteField() : value,
      }
    );
  };

  return (
    <div
      className={`bg-dark-lighten animate-fade-in absolute bottom-[calc(100%+5px)] z-[1] flex gap-1 rounded-full p-[6px] shadow ${
        position === "left" ? "left-8" : "right-8"
      }`}
    >
      {Object.entries(REACTIONS_UI).map(([key, value], index) => (
        <div
          key={key}
          className={`${
            index + 1 === currentReaction
              ? "after:bg-primary relative after:absolute after:left-1/2 after:top-full after:h-[5px] after:w-[5px] after:-translate-x-1/2 after:rounded-full"
              : ""
          }`}
        >
          <img
            onClick={() => {
              if (index + 1 === currentReaction) updateReaction(0);
              else updateReaction(index + 1);
              setIsOpened(false);
            }}
            title={key}
            className={`h-7 w-7 origin-bottom cursor-pointer transition duration-300 hover:scale-[115%]`}
            src={value.gif}
            alt=""
          />
        </div>
      ))}
    </div>
  );
};

export default ReactionPopup;
