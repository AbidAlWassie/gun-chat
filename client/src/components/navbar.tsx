// client/src/components/navbar.tsx
import { Button } from "./ui/button";

interface NavbarProps {
  onLogout: () => void;
}

export function Navbar({ onLogout }: NavbarProps) {
  return (
    <nav className="flex justify-between items-center p-4 border-b">
      <h1 className="text-xl font-bold">Decentralized Chat</h1>
      <Button onClick={onLogout}>Logout</Button>
    </nav>
  );
}
