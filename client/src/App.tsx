// client/src/App.tsx
import Gun from "gun";
import "gun/sea";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Auth } from "./components/auth";
import { ChatForm } from "./components/chat-form";
import { ChatList } from "./components/chat-list";
import { Navbar } from "./components/navbar";

// Use Gun's built-in types
import type { IGunInstance, IGunUserInstance } from "gun";

// Extend IGunInstance for .off()
interface ExtendedGunInstance extends IGunInstance {
  off(event: string, callback: (...args: unknown[]) => void): void;
}

const GUN_URL = import.meta.env.VITE_GUN_URL || "http://localhost:8765/gun";
const gun = Gun({
  peers: [GUN_URL],
  localStorage: true, // Enable SEA persistence
}) as ExtendedGunInstance;
const user: IGunUserInstance = gun.user();

interface Message {
  id: string;
  content: string;
  sender: string;
  createdAt: number;
}

function App() {
  const [alias, setAlias] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    console.log("App mounted, checking auth state...");

    const checkAuth = () => {
      console.log("checkAuth called, user.is:", user.is);
      if (user.is) {
        setIsAuthenticated(true);
        console.log("Session restored for user:", user.is.alias);
      } else {
        console.log("No active session found");
      }
    };

    // Listen for auth events
    gun.on("auth", checkAuth);

    // Attempt to recall session
    user.recall({ sessionStorage: false }, (ack) => {
      console.log("Recall result:", ack);
      if ("err" in ack && ack.err) {
        console.error("Session recall failed:", ack.err);
      } else if (user.is) {
        setIsAuthenticated(true);
        console.log("Session recalled successfully for:", user.is.alias);
      } else {
        console.log("Recall succeeded but no user session available");
      }
    });

    // Initial check with slight delay to ensure Gun initializes
    setTimeout(checkAuth, 100);

    return () => {
      console.log("Cleaning up auth listener");
      gun.off("auth", checkAuth);
    };
  }, []);

  const register = (alias: string, password: string) => {
    user.create(alias, password, (ack: { err?: string; pub?: string }) => {
      if (ack.err) {
        console.error("Registration failed:", ack.err);
      } else {
        console.log("User registered:", ack);
        login(alias, password);
      }
    });
  };

  const login = (alias: string, password: string) => {
    user.auth(alias, password, (ack: { err?: string; sea?: unknown }) => {
      if (ack.err) {
        console.error("Login failed:", ack.err);
      } else {
        console.log("User logged in:", ack);
        setIsAuthenticated(true);
        const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        localStorage.setItem("gun-auth", JSON.stringify({ alias, expiry }));
        console.log("Stored gun-auth:", localStorage.getItem("gun-auth"));
        // Log SEA keys for debugging
        console.log("SEA keys in localStorage:", {
          pub: localStorage.getItem(`sea/pub:${alias}`),
          priv: localStorage.getItem(`sea/priv:${alias}`),
        });
      }
    });
  };

  const logout = () => {
    user.leave();
    console.log("User logged out");
    setIsAuthenticated(false);
    setMessages([]);
    localStorage.removeItem("gun-auth");
    console.log("gun-auth removed from localStorage");
  };

  const joinRoom = () => {
    setMessages([]);
    const messagesRef = gun.get(room);
    messagesRef.map().on((msg: Message & { _?: unknown }, id: string) => {
      if (msg) {
        const messageWithoutMeta = { ...msg };
        delete messageWithoutMeta._;
        setMessages((prevMessages) => {
          const exists = prevMessages.find((m) => m.id === id);
          if (exists) {
            return prevMessages.map((m) =>
              m.id === id ? { ...messageWithoutMeta, id } : m
            );
          }
          return [...prevMessages, { ...messageWithoutMeta, id }];
        });
      }
    });
  };

  const sendMessage = () => {
    if (!message.trim() || !room) return;
    const messageId = uuidv4();
    const newMessage: Message = {
      id: messageId,
      content: message,
      sender: typeof user.is?.alias === "string" ? user.is.alias : "Anonymous",
      createdAt: Date.now(),
    };
    gun
      .get(room)
      .get(messageId)
      .put(newMessage, (ack: { err?: string; ok?: { "": 1 } }) => {
        if (ack.err) {
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
