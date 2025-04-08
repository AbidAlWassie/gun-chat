// client/src/components/chat-form.tsx
import { KeyboardEvent } from "react"; // Import KeyboardEvent type
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface ChatFormProps {
  room: string;
  message: string;
  setRoom: (value: string) => void;
  setMessage: (value: string) => void;
  onJoinRoom: () => void;
  onSendMessage: () => void;
}

export function ChatForm({
  room,
  message,
  setRoom,
  setMessage,
  onJoinRoom,
  onSendMessage,
}: ChatFormProps) {
  // Handle Enter key press
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission or newline
      onSendMessage(); // Trigger the send message function
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input
          type="text"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="Enter chat room"
          className="flex-1"
        />
        <Button onClick={onJoinRoom}>Join Room</Button>
      </div>
      <div className="flex space-x-2">
        <Input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown} // Add keydown handler
          placeholder="Enter your message"
          className="flex-1"
        />
        <Button onClick={onSendMessage}>Send</Button>
      </div>
    </div>
  );
}
