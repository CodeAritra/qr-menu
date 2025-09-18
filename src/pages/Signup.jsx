import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Signup() {
  const { signup } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    try {
      e.preventDefault();
      await signup(username, password);
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="text-2xl font-bold text-center">Signup</h2>
          <form onSubmit={handleSignup} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              className="input input-bordered w-full"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="input input-bordered w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary w-full">
              Signup
            </button>
          </form>
          <p className="text-sm text-center">
            Already have an account?{" "}
            <a href="/login" className="link link-primary">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
