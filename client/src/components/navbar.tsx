// client/src/components/navbar.tsx
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
interface NavbarProps {
  onLogout: () => void;
}

export function Navbar({ onLogout }: NavbarProps) {
  return (
    <nav className="flex justify-between items-center border-b pb-2">
      <h2 className="text-2xl font-bold">Gun Chat</h2>
      <Button onClick={onLogout}>Logout</Button>
      <ModeToggle />
    </nav>
  );
}
