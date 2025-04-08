// client/src/App.tsx
import Gun from "gun";
import "gun/sea";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Auth } from "./components/auth";
import { ChatForm } from "./components/chat-form";
import { ChatList } from "./components/chat-list";
import { Navbar } from "./components/navbar";

const gun = Gun(["http://localhost:8765/gun"]);
const user = gun.user();

function App() {
  const [alias, setAlias] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<
    { id: string; content: string; sender: string; createdAt: number }[]
  >([]);

  const register = (alias: string, password: string) => {
    user.create(alias, password, (ack) => {
      if ("err" in ack && ack.err) {
        console.error("Registration failed:", ack.err);
      } else {
        console.log("User registered:", ack);
        login(alias, password);
      }
    });
  };

  const login = (alias: string, password: string) => {
    user.auth(alias, password, (ack) => {
      if ("err" in ack && ack.err) {
        console.error("Login failed:", ack.err);
      } else {
        console.log("User logged in:", ack);
        setIsAuthenticated(true);
      }
    });
  };

  const logout = () => {
    user.leave();
    console.log("User logged out");
    setIsAuthenticated(false);
    setMessages([]);
  };

  const joinRoom = () => {
    setMessages([]);
    const messagesRef = gun.get(room);
    messagesRef.map().on((msg, id) => {
      if (msg) {
        setMessages((prevMessages) => {
          const exists = prevMessages.find((m) => m.id === id);
          if (exists) {
            return prevMessages.map((m) => (m.id === id ? { id, ...msg } : m));
          }
          return [...prevMessages, { id, ...msg }];
        });
      }
    });
  };

  const sendMessage = () => {
    if (!message.trim() || !room) return;
    const messageId = uuidv4();
    const newMessage = {
      id: messageId,
      content: message,
      sender: user.is?.alias ?? "Anonymous",
      createdAt: Date.now(),
    };
    gun
      .get(room)
      .get(messageId)
      .put(newMessage, (ack) => {
        if ("err" in ack && ack.err) {
          console.error("Error sending message:", ack.err);
        } else {
          console.log("Message sent:", newMessage);
          setMessage("");
        }
      });
  };

  return (
    <main className="h-screen w-screen justify-center items-center overflow-hidden">
      {!isAuthenticated ? (
        <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold pb-2">Gun Chat</h2>
          <Auth
            alias={alias}
            password={password}
            setAlias={setAlias}
            setPassword={setPassword}
            onRegister={() => register(alias, password)}
            onLogin={() => login(alias, password)}
          />
        </div>
      ) : (
        <>
          <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-lg">
            <Navbar onLogout={logout} />
            <div className="max-w-2xl mx-auto my-2">
              <ChatForm
                room={room}
                message={message}
                setRoom={setRoom}
                setMessage={setMessage}
                onJoinRoom={joinRoom}
                onSendMessage={sendMessage}
              />
              <ChatList messages={messages} />
            </div>
          </div>
        </>
      )}
    </main>
  );
}

export default App;
