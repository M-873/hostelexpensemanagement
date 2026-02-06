import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// import { GoogleOAuthProvider } from '@react-oauth/google';

// Replace with your Google Client ID or set in .env
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

createRoot(document.getElementById("root")!).render(
    // <GoogleOAuthProvider clientId={googleClientId}>
    <App />
    // </GoogleOAuthProvider>
);
