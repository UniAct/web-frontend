import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import './styles/globals.css';
import './styles/tailwind-built.css';
import './styles/components/interactive.css';
import './styles/modules/home.css';
import './styles/modules/superadmin.css';

const container = document.getElementById("root");
if (!container) throw new Error("Root container missing in index.html");

createRoot(container).render(
  
    <Router>
      <App />
    </Router>
  
);
