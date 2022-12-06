export interface ConversationInfo {
  users: string[];
  group?: {
    admins: string[];
    groupName: null | string;
    groupImage: null | string;
    groupDescription: null | string;
  };
  isClosed: boolean;
  seen?: Seen;
  updatedAt: number;
  createdAt: number;
  theme: string;
}
export interface Seen {
  [key: string]: {
    seenAt: number;
    messageId: string;
  };
}

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string;
  photoURL: string;
  isSiteAdmin: boolean;
}

export interface MessageItem {
  id?: string;
  sender: string;
  content: string;
  replyTo?: string;
  file?: {
    name: string;
    size: number;
  };
  createdAt: number;
  type: "text" | "image" | "file" | "sticker" | "removed" | "day";
  reactions: {
    [key: string]: number;
  };
}

export interface StickerCollection {
  name: string;
  thumbnail: string;
  icon: string;
  id: string;
  stickers: {
    id: string;
    spriteURL: string;
  }[];
}

export type StickerCollections = StickerCollection[];
