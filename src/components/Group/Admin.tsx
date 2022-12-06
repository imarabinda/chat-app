import { ConversationInfo, UserData } from "../../shared/types";
import { FC, useState } from "react";
import { arrayRemove, doc, updateDoc } from "firebase/firestore";

import { FIRESTORE_CONVERSATIONS_COLLECTION, IMAGE_PROXY } from "../../shared/constants";
import Spin from "react-cssfx-loading/src/Spin";
import { firestore } from "../../shared/firebase";
import { useParams } from "react-router-dom";
import { useUsersInfo } from "../../hooks/useUsersInfo";
import { useAppSelector } from "../../redux/hooks";
import { UsersSliceStateType } from "../../redux/common/reducers/UsersSlice";

interface AdminProps {
  conversation: ConversationInfo;
}

const Admin: FC<AdminProps> = ({ conversation }) => {
  const { id: conversationId } = useParams();

  const { currentUser } = useAppSelector<UsersSliceStateType>(
    (state) => state.users
  );

  const { data, loading, error } = useUsersInfo(
    conversation?.group?.admins as string[] || []
  );

  const handleRemoveAdminPosition = (uid: string) => {
    updateDoc(
      doc(
        firestore,
        FIRESTORE_CONVERSATIONS_COLLECTION,
        conversationId as string
      ),
      {
        "group.admins": arrayRemove(uid),
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
      {data
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

            {conversation.group?.admins?.includes(currentUser?.uid as string) &&
              user.uid !== currentUser?.uid && (
                <div className="group relative flex-shrink-0" tabIndex={0}>
                  <button>
                    <i className="bx bx-dots-horizontal-rounded text-2xl"></i>
                  </button>

                  <div className="bg-dark-lighten border-dark-lighten invisible absolute top-full right-0 z-[1] flex w-max flex-col items-stretch rounded-lg border py-1 opacity-0 transition-all duration-300 group-focus-within:!visible group-focus-within:!opacity-100">
                    <button
                      onClick={() => handleRemoveAdminPosition(user.uid)}
                      className="bg-dark-lighten flex items-center gap-1 px-3 py-1 transition duration-300 hover:brightness-125"
                    >
                      <i className="bx bx-user-x text-2xl"></i>
                      <span>Remove admin position</span>
                    </button>
                  </div>
                </div>
              )}
          </div>
        ))}
    </div>
  );
};

export default Admin;
