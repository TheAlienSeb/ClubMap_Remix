"use client";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  CheckCheck,
  LoaderCircle,
  MessageCircle,
  MessagesSquare,
  Send,
} from "lucide-react";
type Chat = {
  id: string;
  eventId: string;
  title: string;
  attendees: number;
  lastMessage: string | null;
};
type Message = {
  id: string;
  body: string;
  sentAt: string;
  senderId: string;
  sender: string;
  mine: boolean;
};
export default function Groupchats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const bottom = useRef<HTMLDivElement | null>(null);
  const active = chats.find((chat) => chat.id === selected);
  useEffect(() => {
    fetch("/api/chats")
      .then(async (response) => {
        if (!response.ok) throw new Error((await response.json()).error);
        return response.json();
      })
      .then((items: Chat[]) => {
        setChats(items);
        setSelected((current) => current || items[0]?.id || null);
      })
      .catch((reason) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);
  const loadMessages = useCallback(async (chatId: string, quiet = false) => {
    const response = await fetch(`/api/chats/${chatId}/messages`, {
      cache: "no-store",
    });
    if (!response.ok) {
      if (!quiet) setError((await response.json()).error);
      return;
    }
    setMessages(await response.json());
  }, []);
  useEffect(() => {
    if (!selected) return;
    setMessages([]);
    loadMessages(selected);
    const polling = setInterval(() => loadMessages(selected, true), 4000);
    return () => clearInterval(polling);
  }, [selected, loadMessages]);
  useEffect(
    () => bottom.current?.scrollIntoView({ behavior: "smooth" }),
    [messages],
  );
  async function send(event: FormEvent) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !selected) return;
    setDraft("");
    const response = await fetch(`/api/chats/${selected}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    if (!response.ok) {
      setError((await response.json()).error);
      setDraft(body);
      return;
    }
    const message = await response.json();
    setMessages((current) => [...current, { ...message, mine: true }]);
    setChats((current) =>
      current.map((chat) =>
        chat.id === selected ? { ...chat, lastMessage: body } : chat,
      ),
    );
  }
  return (
    <div className="messages-page">
      <aside className="conversation-list">
        <header>
          <p>YOUR EVENT CHATS</p>
          <h1>Messages</h1>
        </header>
        {loading && (
          <div className="chat-loading">
            <LoaderCircle className="spin" />
            Loading conversations
          </div>
        )}
        {chats.map((chat) => (
          <button
            key={chat.id}
            className={`conversation ${selected === chat.id ? "active" : ""}`}
            onClick={() => setSelected(chat.id)}
          >
            <span>
              {chat.title
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </span>
            <div>
              <b>{chat.title}</b>
              <small>{chat.lastMessage || `${chat.attendees} attendees`}</small>
            </div>
          </button>
        ))}
        {!loading && !chats.length && (
          <div className="chat-sidebar-empty">
            <MessagesSquare />
            <b>No event chats yet</b>
            <p>RSVP to an event to join its conversation.</p>
          </div>
        )}
      </aside>
      <section className="chat-window">
        {error && <div className="chat-error">{error}</div>}
        {active ? (
          <>
            <header>
              <div className="status-dot" />
              <div>
                <b>{active.title}</b>
                <span>
                  {active.attendees} attendees · Messages refresh automatically
                </span>
              </div>
            </header>
            <div className="messages">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.mine ? "mine" : ""}`}
                >
                  <small>{message.mine ? "You" : message.sender}</small>
                  <p>{message.body}</p>
                  <span>
                    {new Date(message.sentAt).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                    {message.mine && <CheckCheck />}
                  </span>
                </div>
              ))}
              {!messages.length && (
                <div className="chat-empty">
                  <MessageCircle />
                  <b>Start the conversation</b>
                  <span>Be the first to message this event group.</span>
                </div>
              )}
              <div ref={bottom} />
            </div>
            <form onSubmit={send}>
              <MessageCircle />
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                maxLength={2000}
                placeholder="Message the event group…"
              />
              <button aria-label="Send message" disabled={!draft.trim()}>
                <Send />
              </button>
            </form>
          </>
        ) : (
          <div className="chat-empty full">
            <MessagesSquare />
            <b>Select an event chat</b>
            <span>Your conversations are created from real event RSVPs.</span>
          </div>
        )}
      </section>
    </div>
  );
}
