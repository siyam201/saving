import { createRoot } from "react-dom/client";
import { useLocation } from "wouter";
import { useEffect } from "react";
import App from "./App";
import "./index.css";

// Helper component to manage redirects
function Root() {
  return <App />;
}

createRoot(document.getElementById("root")!).render(<Root />);
