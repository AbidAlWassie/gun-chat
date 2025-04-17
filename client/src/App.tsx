// client/src/App.tsx
import type { IGunInstance, IGunUserInstance } from "gun";
import Gun from "gun";
import SEA from "gun/sea";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Auth } from "./components/auth";
import { ChatForm } from "./components/chat-form";
import { ChatList } from "./components/chat-list";
import { Navbar } from "./components/navbar";

interface ExtendedGunInstance extends IGunInstance {
  off(event: string, callback: (...args: unknown[]) => void): void;
}

const GUN_URL = import.meta.env.VITE_GUN_URL || "http://localhost:8765/gun";
const gun = Gun({
  peers: [GUN_URL],
  localStorage: true,
  SEA,
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
  const [currentAlias, setCurrentAlias] = useState(""); // Store the alias persistently

  useEffect(() => {
    console.log("App mounted, checking auth state...");

    const checkAuth = () => {
      console.log("checkAuth called, user.is:", user.is);
      if (user.is) {
        setIsAuthenticated(true);
        const storedAuth = localStorage.getItem("gun-auth");
        const storedAlias = storedAuth
          ? JSON.parse(storedAuth).alias
          : user.is.alias;
        setCurrentAlias(storedAlias);
        console.log("Session restored for user:", storedAlias);
      } else {
        console.log("No active session found");
      }
    };

    gun.on("auth", checkAuth);

    const storedAuth = localStorage.getItem("gun-auth");
    if (storedAuth) {
      const { alias, expiry, seaPair } = JSON.parse(storedAuth);
      if (Date.now() < expiry && seaPair) {
        user.auth(seaPair, (ack) => {
          console.log("Manual SEA recall result:", ack);
          if ("err" in ack && ack.err) {
            console.error("Manual recall failed:", ack.err);
            localStorage.removeItem("gun-auth");
          } else {
            setIsAuthenticated(true);
            setCurrentAlias(alias);
            console.log("Manual session restored for:", alias);
          }
        });
      } else if (Date.now() < expiry) {
        user.recall({ sessionStorage: false }, (ack) => {
          console.log("Gun recall result:", ack);
          if ("err" in ack && ack.err) {
            console.error("Gun recall failed:", ack.err);
          } else if (user.is) {
            setIsAuthenticated(true);
            setCurrentAlias(alias);
            console.log("Gun session restored for:", alias);
          }
        });
      }
    }

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
        setCurrentAlias(alias);
        const expiry = Date.now() + 24 * 60 * 60 * 1000;
        const authData = {
          alias,
          expiry,
          seaPair: ack.sea,
        };
        localStorage.setItem("gun-auth", JSON.stringify(authData));
        console.log(
          "Stored gun-auth with SEA pair:",
          localStorage.getItem("gun-auth")
        );
        console.log("Native SEA keys in localStorage:", {
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
    setCurrentAlias("");
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
      sender: currentAlias || "Anonymous",
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
