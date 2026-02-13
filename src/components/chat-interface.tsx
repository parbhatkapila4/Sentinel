"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import {
  getAllChats,
  getChatFolders,
  createChat,
  saveChatMessage,
  getChatMessages,
  updateChatTitle,
  deleteChat,
  type ChatListItem,
  type ChatFolder,
} from "@/app/actions/chats";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  attachments?: Attachment[];
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  data?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition?: {
    new(): SpeechRecognition;
  };
  webkitSpeechRecognition?: {
    new(): SpeechRecognition;
  };
  mozSpeechRecognition?: {
    new(): SpeechRecognition;
  };
  msSpeechRecognition?: {
    new(): SpeechRecognition;
  };
}

export function ChatInterface() {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your personal AI Assistant. I can help you analyze your sales pipeline, provide insights about your deals, and answer questions about your data. How can I assist you today?",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [pinnedFoldersExpanded, setPinnedFoldersExpanded] = useState(true);
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [folders, setFolders] = useState<ChatFolder[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null
  );
  const finalTranscriptRef = useRef<string>("");
  const processedFinalTranscriptsRef = useRef<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sendingRef = useRef(false);

  useEffect(() => {
    loadChatsAndFolders();

    if (typeof window !== "undefined") {
      try {
        const win = window as WindowWithSpeechRecognition & {
          SpeechRecognition?: { new(): SpeechRecognition };
          webkitSpeechRecognition?: { new(): SpeechRecognition };
          mozSpeechRecognition?: { new(): SpeechRecognition };
          msSpeechRecognition?: { new(): SpeechRecognition };
        };
        const SpeechRecognitionClass =
          win.SpeechRecognition ||
          win.webkitSpeechRecognition ||
          win.mozSpeechRecognition ||
          win.msSpeechRecognition;

        if (SpeechRecognitionClass) {
          const recognitionInstance = new SpeechRecognitionClass();
          recognitionInstance.continuous = true;
          recognitionInstance.interimResults = true;
          recognitionInstance.lang = "en-US";

          recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
            let latestInterim = "";
            const newFinalParts: string[] = [];

            for (let i = 0; i < event.results.length; i++) {
              const result = event.results.item(i);
              if (result && result.length > 0) {
                const transcript = result.item(0).transcript.trim();
                if (result.isFinal && transcript) {
                  const normalized = transcript.toLowerCase();
                  if (!processedFinalTranscriptsRef.current.has(normalized)) {
                    processedFinalTranscriptsRef.current.add(normalized);
                    newFinalParts.push(transcript);
                  }
                  latestInterim = "";
                } else if (i === event.results.length - 1) {
                  latestInterim = transcript;
                }
              }
            }

            if (newFinalParts.length > 0) {
              finalTranscriptRef.current += newFinalParts.join(" ") + " ";
            }

            const displayText = (
              finalTranscriptRef.current + latestInterim
            ).trim();

            if (displayText) {
              setInput(displayText);
            }
          };

          recognitionInstance.onerror = (
            event: SpeechRecognitionErrorEvent
          ) => {
            console.error("Speech recognition error:", event.error);
            setIsRecording(false);
            if (event.error === "not-allowed") {
              toast.error("Microphone access denied", {
                description:
                  "Please allow microphone access in your browser settings.",
              });
            } else if (event.error === "no-speech") {
              console.log("No speech detected");
            }
          };

          recognitionInstance.onend = () => {
            setIsRecording(false);
            processedFinalTranscriptsRef.current.clear();
          };

          setRecognition(recognitionInstance);
        } else {
          console.warn("Speech Recognition API not available in this browser");
        }
      } catch (error) {
        console.error("Error initializing speech recognition:", error);
      }
    }
  }, []);

  const loadChatsAndFolders = async () => {
    try {
      const [chatsData, foldersData] = await Promise.all([
        getAllChats(),
        getChatFolders(),
      ]);
      setChats(chatsData);
      setFolders(foldersData);
    } catch (error) {
      console.error("Error loading chats:", error);
    } finally {
      setIsLoadingChats(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewChat = async () => {
    try {
      const chatId = await createChat();
      setCurrentChatId(chatId);
      setMessages([
        {
          role: "assistant",
          content:
            "Hello! I'm your personal AI Assistant. I can help you analyze your sales pipeline, provide insights about your deals, and answer questions about your data. How can I assist you today?",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
      await loadChatsAndFolders();
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const handleSelectChat = async (chatId: string) => {
    try {
      const chatMessages = await getChatMessages(chatId);
      setCurrentChatId(chatId);
      setMessages(
        chatMessages.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
          timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }))
      );
    } catch (error) {
      console.error("Error loading chat:", error);
    }
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await deleteChat(chatId);

      if (currentChatId === chatId) {
        setCurrentChatId(null);
        setMessages([
          {
            role: "assistant",
            content:
              "Hello! I'm your personal AI Assistant. I can help you analyze your sales pipeline, provide insights about your deals, and answer any questions about your data. How can I assist you today?",
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      }

      await loadChatsAndFolders();
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading || sendingRef.current) return;
    sendingRef.current = true;

    const userMessage = messageText.trim();
    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
        timestamp,
        attachments: attachments.length > 0 ? [...attachments] : undefined,
      },
    ]);
    setIsLoading(true);

    const currentAttachments = [...attachments];
    setAttachments([]);

    let chatId = currentChatId;
    if (!chatId) {
      try {
        chatId = await createChat();
        setCurrentChatId(chatId);
        if (userMessage.length > 50) {
          await updateChatTitle(chatId, userMessage.substring(0, 50));
        } else {
          await updateChatTitle(chatId, userMessage);
        }
      } catch (error) {
        console.error("Error creating chat:", error);
      }
    }

    if (chatId) {
      try {
        await saveChatMessage(chatId, "user", userMessage);
      } catch (error) {
        console.error("Error saving message:", error);
      }
    }

    let messageContent = userMessage;
    if (currentAttachments.length > 0) {
      const attachmentInfo = currentAttachments
        .map(
          (att) =>
            `[Attachment: ${att.name} (${att.type}, ${formatFileSize(
              att.size
            )})]`
        )
        .join("\n");
      messageContent = `${userMessage}\n\n${attachmentInfo}`;
    }

    const requestBody = {
      messages: [...messages, { role: "user", content: messageContent }],
      attachments: currentAttachments.map((att) => ({
        name: att.name,
        type: att.type,
        size: att.size,
        data: att.data,
      })),
    };

    const maxRetries = 2;

    try {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const response = await fetch("/api/insights/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        if (response.status === 429 && attempt < maxRetries) {
          const data = await response.json().catch(() => ({}));
          const retryAfter =
            Number(response.headers.get("Retry-After")) ||
            (typeof data?.retryAfter === "number" ? data.retryAfter : null) ||
            3;
          const delayMs = Math.min(retryAfter * 1000, 15_000);
          await new Promise((r) => setTimeout(r, delayMs));
          continue;
        }

        if (!response.ok) {
          const errBody = await response.json().catch(() => ({}));
          const errMessage =
            typeof errBody?.error === "string"
              ? errBody.error
              : response.status === 401
                ? "Please sign in again to use the AI assistant."
                : response.status === 429
                  ? "Too many requests. Please wait a moment and try again."
                  : "Sorry, I couldn't complete that. Please try again.";
          throw new Error(errMessage);
        }

        const json = await response.json().catch(() => ({}));
        const payload = json?.data ?? json;
        const content =
          payload?.content != null && String(payload.content).trim() !== ""
            ? String(payload.content)
            : "I couldn't generate a response for that. Please try again.";
        const assistantMessage = {
          role: "assistant" as const,
          content,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        if (chatId) {
          try {
            await saveChatMessage(chatId, "assistant", content);
            await loadChatsAndFolders();
          } catch (error) {
            console.error("Error saving message:", error);
          }
        }
        return;
      }
      throw new Error("Failed to get response");
    } catch (error) {
      console.error("Error:", error);
      const userMessage =
        error instanceof Error ? error.message : "Sorry, I encountered an error. Please try again later.";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: userMessage,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsLoading(false);
      sendingRef.current = false;
    }
  };

  const handleSendMessage = async (messageText: string) => {
    await sendMessage(messageText);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && attachments.length === 0) || isLoading) return;
    await sendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result as string;
        const attachment: Attachment = {
          id: Math.random().toString(36).substring(7),
          name: file.name,
          type: file.type,
          size: file.size,
          data: data,
        };
        setAttachments((prev) => [...prev, attachment]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  const handleVoiceToggle = async () => {
    if (!recognition) {
      try {
        const win = window as WindowWithSpeechRecognition & {
          SpeechRecognition?: { new(): SpeechRecognition };
          webkitSpeechRecognition?: { new(): SpeechRecognition };
          mozSpeechRecognition?: { new(): SpeechRecognition };
          msSpeechRecognition?: { new(): SpeechRecognition };
        };
        const SpeechRecognitionClass =
          win.SpeechRecognition ||
          win.webkitSpeechRecognition ||
          win.mozSpeechRecognition ||
          win.msSpeechRecognition;

        if (!SpeechRecognitionClass) {
          toast.error("Speech recognition not supported", {
            description: "Please use Chrome, Edge, or Safari for voice input.",
          });
          return;
        }

        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch {
          toast.error("Microphone access required", {
            description:
              "Please allow microphone access in your browser settings.",
          });
          return;
        }

        const recognitionInstance = new SpeechRecognitionClass();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = "en-US";

        finalTranscriptRef.current = "";
        processedFinalTranscriptsRef.current.clear();

        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          let latestInterim = "";
          const newFinalParts: string[] = [];

          for (let i = 0; i < event.results.length; i++) {
            const result = event.results.item(i);
            if (result && result.length > 0) {
              const transcript = result.item(0).transcript.trim();
              if (result.isFinal && transcript) {
                const normalized = transcript.toLowerCase();
                if (!processedFinalTranscriptsRef.current.has(normalized)) {
                  processedFinalTranscriptsRef.current.add(normalized);
                  newFinalParts.push(transcript);
                }
                latestInterim = "";
              } else if (i === event.results.length - 1) {
                latestInterim = transcript;
              }
            }
          }

          if (newFinalParts.length > 0) {
            finalTranscriptRef.current += newFinalParts.join(" ") + " ";
          }

          const displayText = (
            finalTranscriptRef.current + latestInterim
          ).trim();

          if (displayText) {
            setInput(displayText);
          }
        };

        recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech recognition error:", event.error);
          setIsRecording(false);
          if (event.error === "not-allowed") {
            toast.error("Microphone access denied", {
              description:
                "Please allow microphone access in your browser settings.",
            });
          }
        };

        recognitionInstance.onend = () => {
          setIsRecording(false);
          processedFinalTranscriptsRef.current.clear();
        };

        setRecognition(recognitionInstance);
        recognitionInstance.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Error initializing speech recognition:", error);
        toast.error("Failed to initialize speech recognition", {
          description: "Please try again.",
        });
      }
      return;
    }

    try {
      if (isRecording) {
        recognition.stop();
        setIsRecording(false);
        finalTranscriptRef.current = "";
        processedFinalTranscriptsRef.current.clear();
      } else {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch {
          toast.error("Microphone access required", {
            description:
              "Please allow microphone access in your browser settings.",
          });
          return;
        }
        finalTranscriptRef.current = "";
        processedFinalTranscriptsRef.current.clear();
        recognition.start();
        setIsRecording(true);
      }
    } catch (error) {
      console.error("Error toggling voice recognition:", error);
      setIsRecording(false);
      toast.error("Failed to start voice recognition", {
        description: "Please try again.",
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const groupedChats = chats.reduce((acc, chat) => {
    if (!acc[chat.date]) {
      acc[chat.date] = [];
    }
    acc[chat.date].push(chat);
    return acc;
  }, {} as Record<string, ChatListItem[]>);

  return (
    <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden bg-[#0b0b0b] max-sm:relative">
      {!isSidebarCollapsed && (
        <div
          className="hidden max-sm:block fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsSidebarCollapsed(true)}
        />
      )}
      <aside
        className={`${isSidebarCollapsed ? "w-14" : "w-72"
          } flex-shrink-0 transition-all duration-300 border-r border-white/10 bg-[#0a0a0a] flex flex-col h-full overflow-hidden relative ${isSidebarCollapsed ? "overflow-visible" : ""
          } max-sm:fixed max-sm:inset-y-0 max-sm:left-0 max-sm:z-50 max-sm:transform max-sm:transition-transform max-sm:duration-300 max-sm:h-dvh max-sm:flex max-sm:flex-col ${isSidebarCollapsed ? "max-sm:-translate-x-full" : "max-sm:translate-x-0"}`}
        style={{
          backgroundImage: `radial-gradient(at 0% 0%, rgba(139, 26, 26, 0.1) 0px, transparent 50%),
                            radial-gradient(at 100% 0%, rgba(107, 15, 15, 0.1) 0px, transparent 50%)`,
        }}
      >
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={`absolute z-10 w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all backdrop-blur-sm border border-white/10 hover:border-white/20 shadow-lg ${isSidebarCollapsed
            ? "top-4 left-1/2 -translate-x-1/2"
            : "top-4 left-4"
            }`}
          aria-label={
            isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
          }
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={isSidebarCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
            />
          </svg>
        </button>

        {!isSidebarCollapsed && (
          <div className="flex-1 flex flex-col h-full overflow-hidden max-sm:absolute max-sm:inset-x-0 max-sm:top-14 max-sm:bottom-0 max-sm:overflow-y-scroll max-sm:overflow-x-hidden max-sm:overscroll-contain max-sm:[touch-action:pan-y] max-sm:[-webkit-overflow-scrolling:touch]">
            <div className="px-5 pt-16 pb-6 border-b border-white/5 max-sm:pt-4 max-sm:pb-4 max-sm:shrink-0">
              <div className="flex items-center gap-3 mb-6 max-sm:mb-4">
                <div className="relative w-11 h-11 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#8b1a1a] via-[#7a1515] to-[#6b0f0f]"></div>

                  <div className="absolute inset-0 bg-gradient-to-br from-white/12 via-transparent to-transparent"></div>

                  <div className="relative w-full h-full flex items-center justify-center">
                    <svg
                      className="w-5.5 h-5.5 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                      <path
                        d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"
                        opacity="0.8"
                      />
                    </svg>
                  </div>

                  <div className="absolute inset-0 rounded-xl border border-white/10"></div>
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    AI Assistant
                  </h2>
                  <p className="text-xs text-white/50">Chat & Insights</p>
                </div>
              </div>

              <button
                onClick={handleNewChat}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#8b1a1a] to-[#6b0f0f] text-white hover:from-[#a52a2a] hover:to-[#8b1a1a] transition-all shadow-lg shadow-[#8b1a1a]/20 hover:shadow-[#8b1a1a]/30 font-medium text-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>New Chat</span>
              </button>
            </div>

            <div className="px-5 py-4 border-b border-white/5 max-sm:shrink-0">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-lg p-3 border border-white/5 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="text-xs text-white/50">Active</span>
                  </div>
                  <p className="text-lg font-semibold text-white">
                    {chats.length}
                  </p>
                  <p className="text-xs text-white/40">Total Chats</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/5 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <svg
                      className="w-3 h-3 text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-xs text-white/50">Today</span>
                  </div>
                  <p className="text-lg font-semibold text-white">
                    {
                      chats.filter((c) => {
                        const chatDate = new Date(c.updatedAt);
                        const today = new Date();
                        return chatDate.toDateString() === today.toDateString();
                      }).length
                    }
                  </p>
                  <p className="text-xs text-white/40">Recent</p>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-b border-white/5 max-sm:shrink-0">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search chats..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 outline-none focus:bg-white/10 focus:border-white/20 transition-all text-sm"
                />
              </div>
            </div>

            <div className="px-5 py-4 border-b border-white/5 max-sm:shrink-0">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-3 font-medium">
                Quick Actions
              </p>
              <nav className="space-y-1">
                <a
                  href="/dashboard"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition-colors">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Home</span>
                </a>
                <Link
                  href="/deals"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition-colors">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25S3 16.556 3 12s4.03-8.25 9-8.25 9 3.694 9 8.25z"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">All Deals</span>
                </Link>
              </nav>
            </div>

            <div className="flex-1 overflow-y-auto px-5 space-y-5 pb-4 max-sm:flex-none max-sm:overflow-visible max-sm:min-h-0">
              {folders.length > 0 && (
                <div>
                  <button
                    onClick={() =>
                      setPinnedFoldersExpanded(!pinnedFoldersExpanded)
                    }
                    className="flex items-center justify-between w-full mb-3 group"
                  >
                    <span className="text-xs text-white/50 uppercase tracking-wider font-semibold flex items-center gap-2">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                      </svg>
                      Pinned Folders
                    </span>
                    <svg
                      className={`w-4 h-4 text-white/40 group-hover:text-white/60 transition-transform ${pinnedFoldersExpanded ? "rotate-180" : ""
                        }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 15l3.75-3.75L15.75 15"
                      />
                    </svg>
                  </button>
                  {pinnedFoldersExpanded && (
                    <div className="space-y-1.5">
                      {folders.map((folder) => (
                        <div
                          key={folder.id}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group border border-white/5"
                        >
                          <div
                            className={`w-1.5 h-8 rounded-full ${folder.color ||
                              "bg-gradient-to-b from-[#8b1a1a] to-[#6b0f0f]"
                              }`}
                          ></div>
                          <svg
                            className="w-4 h-4 text-white/50 group-hover:text-white/70"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                            />
                          </svg>
                          <span className="flex-1 text-sm text-white/70 group-hover:text-white font-medium">
                            {folder.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs text-white/50 uppercase tracking-wider font-semibold flex items-center gap-2">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                      <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                    </svg>
                    Recent Chats
                  </h3>
                  <span className="text-xs text-white/30">{chats.length}</span>
                </div>
                {isLoadingChats ? (
                  <div className="text-center py-4">
                    <div className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                ) : chats.length === 0 ? (
                  <div className="text-center py-8 px-3">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
                      <svg
                        className="w-6 h-6 text-white/40"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <p className="text-xs text-white/40 mb-1">No chats yet</p>
                    <p className="text-xs text-white/30">
                      Start a new conversation!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(groupedChats).map(([date, dateChats]) => (
                      <div key={date}>
                        <p className="text-xs text-white/30 mb-3 px-2 font-medium mt-4 first:mt-0">
                          {date}
                        </p>
                        <div className="space-y-1">
                          {dateChats.map((chat) => (
                            <div
                              key={chat.id}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all group border ${currentChatId === chat.id
                                ? "bg-gradient-to-r from-[#8b1a1a]/20 to-[#6b0f0f]/20 border-[#8b1a1a]/30"
                                : "border-transparent hover:border-white/5"
                                }`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full shrink-0 ${currentChatId === chat.id
                                  ? "bg-[#8b1a1a]"
                                  : "bg-white/20 group-hover:bg-white/30"
                                  }`}
                              ></div>
                              <button
                                onClick={() => handleSelectChat(chat.id)}
                                className="flex items-center gap-2.5 flex-1 min-w-0"
                              >
                                <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-white/10 flex items-center justify-center shrink-0 transition-colors">
                                  <svg
                                    className="w-4 h-4 text-white/50 group-hover:text-white/70"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25S3 16.556 3 12s4.03-8.25 9-8.25 9 3.694 9 8.25z"
                                    />
                                  </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`text-sm text-left truncate font-medium ${currentChatId === chat.id
                                      ? "text-white"
                                      : "text-white/70 group-hover:text-white"
                                      }`}
                                  >
                                    {chat.title}
                                  </p>
                                </div>
                              </button>
                              <button
                                onClick={(e) => handleDeleteChat(chat.id, e)}
                                className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
                                title="Delete chat"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                  />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-white/10 flex-shrink-0">
                <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Try Asking</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => handleSendMessage("Which deals need attention this week?")}
                    className="w-full text-left p-2.5 text-xs text-white/70 bg-white/5 rounded-lg border border-white/10 hover:border-blue-500/30 hover:bg-white/10 transition-all"
                  >
                    {'"Which deals need attention this week?"'}
                  </button>
                  <button
                    onClick={() => handleSendMessage("What's my pipeline forecast?")}
                    className="w-full text-left p-2.5 text-xs text-white/70 bg-white/5 rounded-lg border border-white/10 hover:border-blue-500/30 hover:bg-white/10 transition-all"
                  >
                    {'"What\'s my pipeline forecast?"'}
                  </button>
                  <button
                    onClick={() => handleSendMessage("Show me deals at risk")}
                    className="w-full text-left p-2.5 text-xs text-white/70 bg-white/5 rounded-lg border border-white/10 hover:border-blue-500/30 hover:bg-white/10 transition-all"
                  >
                    {'"Show me deals at risk"'}
                  </button>
                  <button
                    onClick={() => handleSendMessage("Write a follow-up email for my top deal")}
                    className="w-full text-left p-2.5 text-xs text-white/70 bg-white/5 rounded-lg border border-white/10 hover:border-blue-500/30 hover:bg-white/10 transition-all"
                  >
                    {'"Write a follow-up email"'}
                  </button>
                </div>
              </div>

              <div className="p-4 border-t border-white/10 bg-gradient-to-t from-[#0a0a0a] to-transparent flex-shrink-0">
                <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">AI Can Help With</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    <span>Pipeline analysis</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    <span>Deal risk assessment</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                    <span>Follow-up emails</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8b1a1a]"></div>
                    <span>Revenue forecasting</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-white/5 flex-shrink-0">
                <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8b1a1a] to-[#6b0f0f] flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                    N
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      User
                    </p>
                    <p className="text-xs text-white/40 truncate">Free Plan</p>
                  </div>
                  <a
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white/60 hover:bg-white/10 transition-all"
                    title="View Pricing"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0b0b0b] max-sm:w-full max-sm:relative">
        {isSidebarCollapsed && (
          <button
            onClick={() => setIsSidebarCollapsed(false)}
            className="hidden max-sm:flex absolute top-3 left-3 z-40 w-10 h-10 rounded-xl items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all backdrop-blur-sm border border-white/10 hover:border-white/20 shadow-lg"
            aria-label="Open sidebar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        )}

        {messages.length <= 1 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8b1a1a] to-[#6b0f0f] flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path
                  d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"
                  opacity="0.8"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">AI Pipeline Assistant</h2>
            <p className="text-white/60 text-center max-w-md mb-8">
              Ask me anything about your deals, pipeline, or get help writing follow-up emails.
            </p>

            <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
              <button
                onClick={() => handleSendMessage("Which deals should I prioritize this week?")}
                className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-amber-500/30 hover:bg-white/10 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center mb-3 group-hover:bg-amber-500/30 transition-colors">
                  <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-white mb-1">Deal Prioritization</p>
                <p className="text-xs text-white/50">Focus on high-impact opportunities</p>
              </button>

              <button
                onClick={() => handleSendMessage("How can I optimize my revenue this quarter?")}
                className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-emerald-500/30 hover:bg-white/10 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-3 group-hover:bg-emerald-500/30 transition-colors">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-white mb-1">Revenue Optimization</p>
                <p className="text-xs text-white/50">Maximize deal value & close rates</p>
              </button>

              <button
                onClick={() => handleSendMessage("Analyze my win/loss patterns and suggest improvements")}
                className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-cyan-500/30 hover:bg-white/10 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-3 group-hover:bg-cyan-500/30 transition-colors">
                  <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-white mb-1">Win/Loss Analysis</p>
                <p className="text-xs text-white/50">Learn from wins and losses</p>
              </button>

              <button
                onClick={() => handleSendMessage("What's my sales velocity and how can I improve it?")}
                className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-[#8b1a1a]/30 hover:bg-white/10 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#8b1a1a]/20 flex items-center justify-center mb-3 group-hover:bg-[#8b1a1a]/30 transition-colors">
                  <svg className="w-4 h-4 text-[#f87171]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-white mb-1">Sales Velocity</p>
                <p className="text-xs text-white/50">Speed up your sales cycle</p>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0b0b0b] max-sm:p-3 max-sm:pl-5 max-sm:pt-20 max-sm:pb-4 max-sm:space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-4 max-sm:gap-3 ${message.role === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0 max-sm:w-6 max-sm:h-6">
                    <span className="text-white text-sm font-semibold max-sm:text-xs">AI</span>
                  </div>
                )}
                <div className="flex flex-col gap-1 max-w-[90%] sm:max-w-[80%] lg:max-w-[70%] max-sm:max-w-[85%]">
                  <div
                    className={`rounded-2xl px-4 py-3 max-sm:px-3 max-sm:py-3 max-sm:rounded-xl ${message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-[#1a1a1a] text-white border border-white/10"
                      }`}
                  >
                    <div className="prose prose-invert prose-sm max-w-none break-words">
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => (
                            <h1 className="text-lg font-bold text-white mb-2 mt-4 first:mt-0">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-base font-bold text-white mb-2 mt-3 first:mt-0">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-sm font-semibold text-white mb-1.5 mt-2 first:mt-0">
                              {children}
                            </h3>
                          ),
                          p: ({ children }) => (
                            <p className="text-sm text-white/90 mb-2 last:mb-0 leading-relaxed">
                              {children}
                            </p>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-white">
                              {children}
                            </strong>
                          ),
                          em: ({ children }) => (
                            <em className="italic text-white/80">{children}</em>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc list-inside mb-2 space-y-1 text-sm text-white/90">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal list-outside mb-2 space-y-1 text-sm text-white/90 pl-6">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="text-sm text-white/90 leading-relaxed pl-1">
                              {children}
                            </li>
                          ),
                          code: ({ children }) => (
                            <code className="bg-white/10 text-white/90 px-1.5 py-0.5 rounded text-xs font-mono">
                              {children}
                            </code>
                          ),
                          pre: ({ children }) => (
                            <pre className="bg-white/5 border border-white/10 rounded-lg p-3 overflow-x-auto mb-2">
                              {children}
                            </pre>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-2 border-white/20 pl-3 italic text-white/70 mb-2">
                              {children}
                            </blockquote>
                          ),
                        }}
                      >
                        {message.content ?? ""}
                      </ReactMarkdown>
                    </div>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-3 space-y-2 pt-3 border-t border-white/20">
                        {message.attachments.map((att) => (
                          <div
                            key={att.id}
                            className="flex items-center gap-2 p-2 rounded-lg bg-white/10"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                              />
                            </svg>
                            <span className="text-xs truncate flex-1">
                              {att.name}
                            </span>
                            <span className="text-xs opacity-70">
                              {formatFileSize(att.size)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {message.timestamp && (
                    <span className="text-xs text-white/40 px-1">
                      {message.timestamp}
                    </span>
                  )}
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0 max-sm:w-6 max-sm:h-6">
                    <span className="text-white text-sm font-semibold max-sm:text-xs">U</span>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4 justify-start max-sm:gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0 max-sm:w-6 max-sm:h-6">
                  <span className="text-white text-sm font-semibold max-sm:text-xs">AI</span>
                </div>
                <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl px-4 py-3 max-sm:px-3 max-sm:py-3 max-sm:rounded-xl">
                  <div className="flex gap-1 max-sm:gap-0.5">
                    <div
                      className="w-2 h-2 bg-white/40 rounded-full animate-bounce max-sm:w-1.5 max-sm:h-1.5"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-white/40 rounded-full animate-bounce max-sm:w-1.5 max-sm:h-1.5"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-white/40 rounded-full animate-bounce max-sm:w-1.5 max-sm:h-1.5"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="max-sm:h-5" />
          </div>
        )}

        <div className="flex-shrink-0 p-4 border-t border-white/10 bg-[#0a0a0a] max-sm:px-4 max-sm:pt-3 max-sm:pb-4 max-sm:pl-5">
          {attachments.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2 max-sm:mb-2 max-sm:gap-1.5">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1a1a1a] border border-white/10 max-sm:px-2 max-sm:py-1.5 max-sm:gap-1.5"
                >
                  <svg
                    className="w-4 h-4 text-white/50 max-sm:w-3.5 max-sm:h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                  <span className="text-sm text-white/90 truncate max-w-[200px] max-sm:text-xs max-sm:max-w-[120px]">
                    {att.name}
                  </span>
                  <span className="text-xs text-white/50 max-sm:text-[10px]">
                    {formatFileSize(att.size)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(att.id)}
                    className="ml-1 text-white/40 hover:text-white/60 max-sm:ml-0.5"
                  >
                    <svg
                      className="w-4 h-4 max-sm:w-3.5 max-sm:h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-3 items-end max-sm:gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(
                    e.target.scrollHeight,
                    200
                  )}px`;
                }}
                onKeyDown={handleKeyDown}
                placeholder="type your prompt here"
                rows={1}
                disabled={isLoading}
                className="w-full px-4 py-3 text-sm sm:text-base pr-24 rounded-2xl bg-gray-800 text-white placeholder-white/40 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed max-sm:px-3 max-sm:py-2.5 max-sm:text-sm max-sm:pr-20 max-sm:rounded-xl"
                style={{ maxHeight: "200px" }}
              />
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="*/*"
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-2 max-sm:right-1.5 max-sm:bottom-1.5 max-sm:gap-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors max-sm:w-7 max-sm:h-7"
                  title="Attach file"
                >
                  <svg
                    className="w-5 h-5 max-sm:w-4 max-sm:h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l7.693-7.693a3 3 0 013.182-3.182h.375a3 3 0 013 3v.375a3 3 0 01-3.182 3.182h-.375l-7.693 7.693a1.5 1.5 0 102.121 2.121l7.693-7.693a3 3 0 013.182-3.182h.375a3 3 0 013 3v.375a3 3 0 01-3.182 3.182z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleVoiceToggle}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors max-sm:w-7 max-sm:h-7 ${isRecording
                    ? "bg-red-500 text-white animate-pulse"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                  title={isRecording ? "Stop recording" : "Start voice input"}
                >
                  <svg
                    className="w-5 h-5 max-sm:w-4 max-sm:h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                    />
                  </svg>
                </button>
                <button
                  type="submit"
                  disabled={
                    (!input.trim() && attachments.length === 0) || isLoading
                  }
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors max-sm:w-7 max-sm:h-6 text-white/60 hover:text-white hover:bg-white/10 disabled:bg-transparent disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-white/60 disabled:cursor-not-allowed"
                >
                  <svg
                    className="w-4 h-4 max-sm:w-3.5 max-sm:h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
