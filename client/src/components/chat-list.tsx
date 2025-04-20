// client/src/components/chat-list.tsx
import { useEffect, useRef } from "react";

interface Message {
  id: string;
  content: string;
  sender: string;
  createdAt: number;
}

interface ChatListProps {
  messages: Message[];
}

export function ChatList({ messages }: ChatListProps) {
  // Create a ref for the messages container
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Format timestamp to a readable format
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Format date if message is from a different day
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.getDate() === today.getDate() - 1) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Group messages by date
  const groupedMessages = messages
    .sort((a, b) => a.createdAt - b.createdAt)
    .reduce<Record<string, Message[]>>((groups, message) => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    }, {});

  return (
    <div className="h-[400px] overflow-y-auto my-4 px-2">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date} className="mb-4">
          <div className="text-center my-2">
            <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
              {formatDate(dateMessages[0].createdAt)}
            </span>
          </div>
          <ul className="space-y-2">
            {dateMessages.map((message) => (
              <li
                key={message.id}
                className="p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex justify-between items-start">
                  <strong className="font-semibold">{message.sender}</strong>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(message.createdAt)}
                  </span>
                </div>
                <p className="mt-1 break-words">{message.content}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {messages.length === 0 && (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          No messages yet. Join a room and start chatting!
        </div>
      )}
      {/* Invisible element to scroll to */}
      <div ref={messagesEndRef} />
    </div>
  );
}
