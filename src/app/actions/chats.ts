"use server";

import { getAuthenticatedUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";

export interface ChatListItem {
  id: string;
  title: string | null;
  date: string;
  updatedAt: Date;
}

export interface ChatFolder {
  id: string;
  name: string;
  color: string | null;
}

export async function getAllChats(): Promise<ChatListItem[]> {
  const userId = await getAuthenticatedUserId();

  const chats = await prisma.chat.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: {
      id: true,
      title: true,
      updatedAt: true,
    },
  });

  const now = new Date();
  return chats.map((chat) => {
    const daysDiff = Math.floor(
      (now.getTime() - chat.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    let date: string;
    if (daysDiff === 0) {
      date = "Today";
    } else if (daysDiff === 1) {
      date = "Yesterday";
    } else if (daysDiff < 7) {
      date = `${daysDiff} days ago`;
    } else {
      date = formatDistanceToNow(chat.updatedAt, { addSuffix: true });
    }

    return {
      id: chat.id,
      title: chat.title || "New Chat",
      date,
      updatedAt: chat.updatedAt,
    };
  });
}

export async function getChatFolders(): Promise<ChatFolder[]> {
  const userId = await getAuthenticatedUserId();

  const folders = await prisma.chatFolder.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      color: true,
    },
  });

  return folders;
}

export async function createChat(title?: string): Promise<string> {
  const userId = await getAuthenticatedUserId();

  const chat = await prisma.chat.create({
    data: {
      userId,
      title: title || null,
    },
  });

  return chat.id;
}

export async function updateChatTitle(chatId: string, title: string) {
  const userId = await getAuthenticatedUserId();

  await prisma.chat.updateMany({
    where: {
      id: chatId,
      userId,
    },
    data: {
      title,
    },
  });
}

export async function saveChatMessage(
  chatId: string,
  role: "user" | "assistant",
  content: string
) {
  const userId = await getAuthenticatedUserId();

  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      userId,
    },
  });

  if (!chat) {
    throw new Error("Chat not found");
  }

  await prisma.chatMessage.create({
    data: {
      chatId,
      role,
      content,
    },
  });

  await prisma.chat.update({
    where: { id: chatId },
    data: { updatedAt: new Date() },
  });
}

export async function getChatMessages(chatId: string) {
  const userId = await getAuthenticatedUserId();

  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      userId,
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!chat) {
    throw new Error("Chat not found");
  }

  return chat.messages;
}

export async function createChatFolder(name: string, color?: string) {
  const userId = await getAuthenticatedUserId();

  const folder = await prisma.chatFolder.create({
    data: {
      userId,
      name,
      color: color || null,
    },
  });

  return folder;
}

export async function deleteChat(chatId: string) {
  const userId = await getAuthenticatedUserId();

  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      userId,
    },
  });

  if (!chat) {
    throw new Error("Chat not found");
  }

  await prisma.chat.delete({
    where: { id: chatId },
  });
}
