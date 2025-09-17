import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "react-hot-toast";
import { MenuProvider } from "./context/MenuContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <>
    <AuthProvider>
      <MenuProvider>
        <CartProvider>
          <App />
          <Toaster position="top-right" reverseOrder={false} />
        </CartProvider>
      </MenuProvider>
    </AuthProvider>
  </>
  // </StrictMode>,
);
