"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, Trash2, X, User, Bot } from "lucide-react";

interface ChatMsg {
  id: string;
  sender: string;
  text: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMsg[];
}

export default function AdminChatsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected]);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/admin/chats");
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/chats?id=${id}`, { method: "DELETE" });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("fr-DZ", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">جاري تحميل المحادثات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المحادثات</h1>
          <p className="text-sm text-gray-500">
            إدارة محادثات الدعم الفني ({conversations.length})
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1 space-y-2">
          {conversations.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">لا توجد محادثات</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const lastMsg = conv.messages[conv.messages.length - 1];
              const preview = lastMsg
                ? lastMsg.text.slice(0, 60) + (lastMsg.text.length > 60 ? "..." : "")
                : "فارغة";
              const isSelected = selected?.id === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => setSelected(conv)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? "bg-black text-white border-black"
                      : "bg-white border-gray-100 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs mb-1 ${isSelected ? "text-white/60" : "text-gray-400"}`}>
                        {formatDate(conv.updatedAt)}
                      </p>
                      <p className={`text-sm font-medium truncate ${isSelected ? "text-white" : "text-gray-900"}`}>
                        {conv.messages.length} رسالة
                      </p>
                      <p className={`text-xs truncate mt-1 ${isSelected ? "text-white/70" : "text-gray-500"}`}>
                        {preview}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(conv.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-100 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Chat View */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-white rounded-xl border border-gray-100 flex flex-col h-[600px]">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">محادثة</p>
                  <p className="text-xs text-gray-400">
                    {selected.messages.length} رسالة — {formatDate(selected.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {selected.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.sender !== "user" && (
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="w-3.5 h-3.5 text-gray-500" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] px-4 py-2.5 text-sm leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-gray-100 text-gray-800 rounded-2xl rounded-br-md"
                          : "bg-black text-white rounded-2xl rounded-bl-md"
                      }`}
                    >
                      {msg.text}
                    </div>
                    {msg.sender === "user" && (
                      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="w-3.5 h-3.5 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 flex items-center justify-center h-[600px]">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">اختر محادثة لعرضها</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
