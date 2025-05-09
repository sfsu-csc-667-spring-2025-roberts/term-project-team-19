import { useAuth } from "../contexts/auth";

export default function Landing() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Welcome to Our Game</h1>
      {user ? (
        <div>
          <p>Welcome back, {user.username}!</p>
          <a href="/games">Go to Games</a>
        </div>
      ) : (
        <div>
          <p>Please log in to continue</p>
          <a href="/login">Login</a>
        </div>
      )}
    </div>
  );
}
