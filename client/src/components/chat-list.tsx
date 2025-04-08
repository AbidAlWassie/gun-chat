// client/src/components/chat-list.tsx
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
  return (
    <div className="h-[400px] overflow-y-auto mb-4">
      <ul className="space-y-2">
        {messages
          .sort((a, b) => a.createdAt - b.createdAt)
          .map((m) => (
            <li key={m.id} className="p-2 border rounded-lg">
              <strong className="font-semibold">{m.sender}: </strong>
              <span>{m.content}</span>
            </li>
          ))}
      </ul>
    </div>
  );
}
