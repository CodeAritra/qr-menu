import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "react-hot-toast";
import { MenuProvider } from "./context/MenuContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <>
    <AuthProvider>
      <MenuProvider>
        <App />
        <Toaster position="top-right" reverseOrder={false} />
      </MenuProvider>
    </AuthProvider>
  </>
  // </StrictMode>,
);
