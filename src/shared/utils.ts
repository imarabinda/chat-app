import dayjs from "dayjs";
// @ts-ignore
import lodash from "lodash";
import moment from "moment";
import { ServerTimeStamp } from "./types";

export const formatFileName = (name: string) => {
  const splitted = name.split(".");

  const extension = splitted.slice(-1)[0];
  const baseName = splitted.slice(0, -1).join(".");

  return `${Date.now()}-${lodash.kebabCase(
    baseName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
  )}.${extension}`;
};

export const formatFileSize = (size: number) => {
  let i = Math.floor(Math.log(size) / Math.log(1024));

  return `${(size / Math.pow(1024, i)).toFixed(1)} ${
    ["B", "KB", "MB", "GB", "TB"][i]
  }`;
};

export const formatMessageTime = (timestamp: ServerTimeStamp) => {
  return null;
};
export const formatDateMessageGrouping = (date: string) => {
  const momentDate = moment(date, "YYYY-MM-DD");
  const todaysDate = moment(new Date());
  if (momentDate.isSame(todaysDate.startOf("day"), "d")) {
    return "Today";
  }
  if (momentDate.isSame(todaysDate.subtract(1, "days").startOf("day"), "d")) {
    return "Yesterday";
  }
  if (momentDate.isAfter(todaysDate.subtract(7, "days").startOf("day"), "d")) {
    return momentDate.format("dddd");
  }
  return momentDate.format("LL");
};

export const formatDate = (timestamp: ServerTimeStamp) => {
  const timestampTemp = timestamp?.seconds
    ? timestamp?.seconds * 1000
    : Date.now();
  const date = new Date(timestampTemp);
  const formatter = dayjs(date);
  const now = new Date();

  if (dayjs().isSame(formatter, "date")) return formatter.format("h:mm A");

  if (dayjs().isSame(formatter, "week")) return formatter.format("ddd h:mm A");

  if (now.getFullYear() === date.getFullYear())
    return formatter.format("MMM DD h:mm A");

  return formatter.format("DD MMM YYYY h:mm A");
};

export const splitLinkFromMessage = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, (url) => {
    return `<a target="_blank" href="${url}">${url}</a>`;
  });
};
