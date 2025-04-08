// client/src/components/auth.tsx
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface AuthProps {
  alias: string;
  password: string;
  setAlias: (value: string) => void;
  setPassword: (value: string) => void;
  onRegister: () => void;
  onLogin: () => void;
}

export function Auth({
  alias,
  password,
  setAlias,
  setPassword,
  onRegister,
  onLogin,
}: AuthProps) {
  return (
    <div className="space-y-4">
      <Input
        type="text"
        value={alias}
        onChange={(e) => setAlias(e.target.value)}
        placeholder="Username"
      />
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <div className="flex space-x-2">
        <Button onClick={onRegister}>Register</Button>
        <Button onClick={onLogin}>Login</Button>
      </div>
    </div>
  );
}
