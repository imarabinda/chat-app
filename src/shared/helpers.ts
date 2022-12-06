import moment from "moment";
import {
  addDoc,
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  setDoc,
  where,
} from "firebase/firestore";
import { ConversationInfo, MessageItem, UserData } from "./types";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import {
  onDisconnect,
  onValue,
  ref,
  serverTimestamp as serverTimestampDatabase,
  update,
} from "firebase/database";
import lodash from "lodash";
import {
  FIREBASE_UPLOAD_PATH,
  FIRESTORE_CONVERSATIONS_COLLECTION,
  FIRESTORE_USERS_COLLECTION,
  MAXIMUM_GROUP_IMAGE_SIZE,
  REALTIME_DATABASE_CONVERSATIONS_TABLE,
  REALTIME_DATABASE_USERS_TABLE,
  THEMES,
} from "./constants";
import { database, firestore, storage } from "./firebase";
import { store } from "../redux/store";
import { formatDate, formatFileName, formatFileSize } from "./utils";

export function checkCookie(): boolean {
  var cookieEnabled = navigator.cookieEnabled;
  if (!cookieEnabled) {
    document.cookie = "cookieEnabled";
    cookieEnabled = document.cookie.indexOf("cookieEnabled") !== -1;
  }
  return cookieEnabled;
}

export function getAppName(): string {
  return import.meta.env?.VITE_APP_NAME?.toString() || "";
}

export function getAppEnv(): string {
  return import.meta.env?.VITE_APP_ENV?.toString() || "";
}

export const isProduction: boolean =
  import.meta.env?.VITE_APP_ENV === "production";
export const isDevelopment: boolean =
  import.meta.env?.VITE_APP_ENV === "development";
export const isLocalhost: boolean = Boolean(
  window.location.hostname === "localhost" ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === "[::1]" ||
    // 127.0.0.0/8 are considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

export const createConversation = async (
  currentUser: UserData,
  users: ConversationInfo["users"] = [],
  data?: ConversationInfo["group"],
  isGroup = false,
  image?: File
) => {
  if (users?.length < 1) {
    return undefined;
  }

  users = lodash.uniq([...users, currentUser?.uid]);
  const sorted = users?.sort();
  let previousDataExist: QuerySnapshot<DocumentData> | null = null;
  
  if (!isGroup) {
    previousDataExist = await getDocs(
      query(
        collection(firestore, FIRESTORE_CONVERSATIONS_COLLECTION),
        where("isClosed", "==", false),
        where("users", "==", sorted)
      )
    );
  }

  if (
    !previousDataExist ||
    (previousDataExist && previousDataExist.empty)
  ) {
    const documentRef = doc(
      collection(firestore, FIRESTORE_CONVERSATIONS_COLLECTION)
    );
    let groupData = { admins: [currentUser?.uid] };
    if (isGroup) {
      let { url, error } = await groupProfileImageUpload(image, documentRef.id);
      if (error) {
        return;
      }
      groupData = {
        ...groupData,
        groupImage: url || "",
        ...data,
      };
    }
    const created = await setDoc(
      doc(firestore, FIRESTORE_CONVERSATIONS_COLLECTION, documentRef.id),
      {
        users: sorted,
        group: groupData,
        updatedAt: getUtcTime(),
        createdAt: getUtcTime(),
        seen: {},
        createdBy: currentUser?.uid,
        theme: THEMES[0],
        isClosed: false,
      },
      {
        merge: true,
      }
    );

    return documentRef.id;
  } else {
    return previousDataExist?.docs?.[0]?.id;
  }
};

export const updateUserToFirebase = async ({
  userId,
  data,
}: {
  userId: string;
  data: UserData;
}) => {
  await setDoc(
    doc(firestore, FIRESTORE_USERS_COLLECTION, userId),
    {
      ...data,
      updatedAt: getUtcTime(),
    },
    { merge: true }
  );
};

export const establishSocketConnection = () => {
  const refPath = getUserDatabaseReference();
  if (!refPath) {
    return () => {};
  }
  const reference = ref(database, refPath);
  const connectedRef = ref(database, ".info/connected");
  return onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
      update(reference, { status: "online" });
      onDisconnect(reference).update(getOfflineUpdateData("disconnected"));
    }
  });
};

export const getUserDatabaseReference = (userId?: string) => {
  if (!userId) {
    userId = store.getState()?.users?.currentUser?.uid;
  }
  if (!userId) {
    return undefined;
  }
  return `${REALTIME_DATABASE_USERS_TABLE}/${userId}`;
};

export const getUserConnectionDatabaseReference = (userId: string) => {
  return getUserDatabaseReference(userId) + "/connectionsCount";
};
export const getUserMeetingDatabaseReference = (userId: string) => {
  return getUserDatabaseReference(userId) + "/meetingsCount";
};

export const getConversationReference = (conversationId: string) => {
  if (!conversationId) {
    return undefined;
  }
  return `${REALTIME_DATABASE_CONVERSATIONS_TABLE}/${conversationId}`;
};

export const setUserStatusLoggedOut = (userId: string) => {
  const refPath = getUserDatabaseReference(userId);
  if (!refPath) {
    return;
  }
  const refStatus = ref(database, refPath);
  update(refStatus, getOfflineUpdateData());
};

const getOfflineUpdateData = (status?: string) => {
  return {
    lastSeen: serverTimestampDatabase(),
    status: status || "offline",
  };
};

export const groupProfileImageUpload = async (
  file?: File,
  conversationId?: string
) => {
  if (!file || !conversationId) return { url: "", error: "" };

  if (!file?.type?.startsWith("image")) {
    return { error: "File is not an image" };
  }

  if (file?.size > MAXIMUM_GROUP_IMAGE_SIZE) {
    return {
      error: `Max image size is ${formatFileSize(
        MAXIMUM_GROUP_IMAGE_SIZE
      )} bytes`,
    };
  }
  const url = await uploadToFirebaseStorage(file, conversationId);
  return { url };
};

export const uploadToFirebaseStorage = async (file: File, subDir: string) => {
  const fileReference = storageRef(
    storage,
    `${FIREBASE_UPLOAD_PATH}/conversations/${subDir}/${formatFileName(
      file?.name
    )}`
  );
  await uploadBytes(fileReference, file);
  const downloadURL = await getDownloadURL(fileReference);
  return downloadURL;
};

function groupedDays(messages: any) {
  return (
    messages
      //@ts-ignore
      .map((doc) => ({ id: doc?.id, ...doc?.data() }))
      //@ts-ignore
      .reduce((acc, el, i) => {
        const messageDay = moment(new Date(el?.createdAt)).format("YYYY-MM-DD");
        if (acc[messageDay]) {
          return { ...acc, [messageDay]: acc[messageDay].concat([el]) };
        }
        return { ...acc, [messageDay]: [el] };
      }, {})
  );
}

export function generateItems(messages: QueryDocumentSnapshot<DocumentData>[]):MessageItem[] {
  const days = groupedDays(messages);
  const sortedDays = Object.keys(days)?.sort(
    (x, y) => moment(x, "YYYY-MM-DD").unix() - moment(y, "YYYY-MM-DD").unix()
  );
  const items = sortedDays?.reduce((acc, date) => {
    const sortedMessages = days[date]?.sort(
      (x: any, y: any) =>
        //@ts-ignore
        moment(new Date(x?.createdAt)).unix() -
        moment(new Date(y?.createdAt)).unix()
    );
    //@ts-ignore
    return acc?.concat([{ type: "day", content:date, id: date }, ...sortedMessages]);
  }, []);
  return items;
}

export const getUtcTime = () => {
  return moment.utc().unix() * 1000; //in milliseconds;
};

export const getShortMessageInfo = (data: MessageItem) => {
  let response =
    data?.type === "image"
      ? "📷 Image"
      : data?.type === "file"
      ? `📄 Document: ${data?.file?.name.split(".").slice(-1)[0]}`
      : data?.type === "sticker"
      ? "A sticker"
      : data?.type === "removed"
      ? "Message removed."
      : data?.content;

  const seconds = data?.createdAt;
  const formattedDate = formatDate(seconds ? seconds : getUtcTime());

  return response?.length > 25 - formattedDate?.length
    ? `${response?.slice(0, 25 - formattedDate?.length)}...`
    : response;
};
