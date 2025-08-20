import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.scss";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
	<React.StrictMode>
		<BrowserRouter basename="/x4-blueprint-builder">
			<App />
		</BrowserRouter>
	</React.StrictMode>
);
