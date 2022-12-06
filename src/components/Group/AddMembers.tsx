import { ConversationInfo, UserData } from "../../shared/types";
import {
  arrayUnion,
  collection,
  doc,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { FC } from "react";
import { FIRESTORE_CONVERSATIONS_COLLECTION, FIRESTORE_USERS_COLLECTION, IMAGE_PROXY } from "../../shared/constants";
import Spin from "react-cssfx-loading/src/Spin";
import { firestore } from "../../shared/firebase";
import { useCollectionQuery } from "../../hooks/useCollectionQuery";
import { useParams } from "react-router-dom";

interface AddMembersProps {
  conversations: ConversationInfo;
}

const AddMembers: FC<AddMembersProps> = ({ conversations }) => {
  const { id: conversationId } = useParams();

  const { data, loading, error } = useCollectionQuery(
    `all-users-except-${JSON.stringify(conversations.users)}`,
    query(
      collection(firestore, FIRESTORE_USERS_COLLECTION),
      where("uid", "not-in", conversations.users.slice(0, 10))
    )
  );

  const handleAddMember = (uid: string) => {
    updateDoc(
      doc(
        firestore,
        FIRESTORE_CONVERSATIONS_COLLECTION,
        conversationId as string
      ),
      {
        users: arrayUnion(uid),
      }
    );
  };

  if (loading || error)
    return (
      <div className="flex h-80 items-center justify-center">
        <Spin />
      </div>
    );

  return (
    <div className="flex h-80 flex-col items-stretch gap-4 overflow-y-auto overflow-x-hidden py-4">
      {data?.docs
        ?.map((item) => item.data() as UserData)
        .map((user) => (
          <div key={user.uid} className="flex items-center gap-3 px-4">
            <img
              className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
              src={IMAGE_PROXY(user.photoURL)}
              alt=""
            />
            <div className="flex-grow">
              <h1>{user.displayName}</h1>
            </div>
            <button onClick={() => handleAddMember(user.uid)}>
              <i className="bx bx-plus text-2xl"></i>
            </button>
          </div>
        ))}
      {data?.empty && <p className="text-center">No more user to add</p>}
    </div>
  );
};

export default AddMembers;
