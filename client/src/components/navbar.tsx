// client/src/components/navbar.tsx
import { GiPistolGun } from "react-icons/gi";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
interface NavbarProps {
  onLogout: () => void;
}

export function Navbar({ onLogout }: NavbarProps) {
  return (
    <nav className="flex justify-between items-center border-b pb-2">
      <h2 className="text-2xl font-bold flex items-center">
        <GiPistolGun className="h-8 w-8 text-foreground" />
        <span className="mb-1 ml-1">Gun Chat</span>
      </h2>
      <Button onClick={onLogout} className="bg-foreground text-foreground">
        Logout
      </Button>
      <ModeToggle />
    </nav>
  );
}
