export const DEFAULT_AVATAR = "/default-avatar.png";
export const IMAGE_PROXY = (url: string) =>
  `https://apoqrsgtqq.cloudimg.io/${url}`;

export const STICKERS_URL =
  "https://cdn.jsdelivr.net/gh/naptestdev/zalo-stickers/data/favourite.json";

export const FILE_ICON = (extension: string) =>
  `https://cdn.jsdelivr.net/gh/napthedev/file-icons/file/${extension}.svg`;

export const REACTIONS_UI: {
  [key: string]: {
    icon: string;
    gif: string;
  };
} = {
  Like: {
    icon: "/reactions-icon/like.svg",
    gif: "/reactions/like.gif",
  },
  Love: {
    icon: "/reactions-icon/love.svg",
    gif: "/reactions/love.gif",
  },
  Care: {
    icon: "/reactions-icon/care.svg",
    gif: "/reactions/care.gif",
  },
  Haha: {
    icon: "/reactions-icon/haha.svg",
    gif: "/reactions/haha.gif",
  },
  Wow: {
    icon: "/reactions-icon/wow.svg",
    gif: "/reactions/wow.gif",
  },
  Sad: {
    icon: "/reactions-icon/sad.svg",
    gif: "/reactions/sad.gif",
  },
  Angry: {
    icon: "/reactions-icon/angry.svg",
    gif: "/reactions/angry.gif",
  },
};

export const EMOJI_REPLACEMENT = {
  "😭": ["ToT", "T-T", "T_T", "T.T", ":((", ":-(("],
  "😓": ["'-_-"],
  "😜": [";p", ";-p", ";P", ";-P"],
  "😑": ["-_-"],
  "😢": [":'(", ":'-("],
  "😞": [":(", ":-(", "=(", ")=", ":["],
  "😐": [":|", ":-|"],
  "😛": [":P", ":-P", ":p", ":-p", "=P", "=p"],
  "😁": [":D", ":-D", "=D", ":d", ":-d", "=d"],
  "😗": [":*", ":-*"],
  "😇": ["O:)", "O:-)"],
  "😳": ["O_O", "o_o", "0_0"],
  "😊": ["^_^", "^~^", "=)"],
  "😠": [">:(", ">:-(", ">:o", ">:-o", ">:O", ">:-O"],
  "😎": ["8)", "B)", "8-)", "B-)", ":))"],
  "😚": ["-3-"],
  "😉": [";)", ";-)"],
  "😲": [":O", ":o", ":-O", ":-o"],
  "😣": [">_<", ">.<"],
  "😘": [";*", ";-*"],
  "😕": [":/", ":-/", ":\\", ":-\\", "=/", "=\\"],
  "🙂": [":)", ":]", ":-)", "(:", "(="],
  "♥": ["<3"],
  "😂": [":')"],
  "🤑": ["$-)"],
};

export const EMOJI_REGEX = /^\p{Extended_Pictographic}$/u;

export const THEMES = [
  "#0D90F3",
  "#EB3A2A",
  "#0AD4EB",
  "#643ECB",
  "#93BF34",
  "#E84FCF",
  "#B43F3F",
  "#E6A50A",
  "#69C90C",
];

export const FIRESTORE_CONVERSATIONS_COLLECTION = "conversations";
export const FIRESTORE_MESSAGES_COLLECTION = "messages";
export const FIRESTORE_USERS_COLLECTION = "users";

export const MESSAGE_STACK_BY_TIME_DIFFERENCE = 70 * 1000; //in milli seconds

//limits create chat
export const MAXIMUM_GROUP_NAME_CHARS = 30;
export const MAXIMUM_GROUP_DESCRIPTION_CHARS = 100;
export const MAXIMUM_GROUP_MEMBERS = 50;
export const MINIMUM_GROUP_MEMBERS = 1;
//message in bytes
export const MAXIMUM_FILE_UPLOAD_SIZE = 20 * 1020 * 1024;

//maximum group image bytes
export const MAXIMUM_GROUP_IMAGE_SIZE = 5 * 1024 * 1024;

//mail sent after
export const MAIL_SEND_AFTER = 4 * 60 * 60 * 1000;

export const REALTIME_DATABASE_USERS_TABLE = "users";
export const REALTIME_DATABASE_CONVERSATIONS_TABLE = "conversations";
export const REALTIME_DATABASE_PUSH_TOKENS_TABLE = "tokens";
export const REALTIME_DATABASE_MAIL_NOTIFICATION_TABLE = "mail_notifications";
export const FIREBASE_UPLOAD_PATH = "uploads";
