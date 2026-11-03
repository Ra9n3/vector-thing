import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

const fixture = import.meta.env.DEV && new URLSearchParams(window.location.search).get('fixture');
const render = () => createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
if (fixture) void import('../qa/loadFixture').then(({loadFixture})=>{loadFixture(fixture);render();});
else render();
