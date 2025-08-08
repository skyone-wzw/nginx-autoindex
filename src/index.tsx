import React from "react";
import ReactDOM from "react-dom/client";
import "./default.css";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import ErrorBoundary from "./ErrorBoundary";
import NginxAutoIndex from "./NginxAutoIndex";
import {ThemeProvider} from "./theme";

declare global {
    interface Window {
        siteConfig: {
            name: string,
            title: string,
            footer: string,
            readme: boolean | string,
            before: boolean,
        };
        assets?: {
            css: string[],
            js: string[],
        }
    }
}

if (process.env.NODE_ENV === "development") {
    if (module && module.hot) {
        module.hot.accept();
    }
} else {
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("/nginx-autoindex/sw.js")
                .then(registration => {
                    console.log("Service Worker registered with scope:", registration.scope);
                })
                .catch(error => {
                    console.error("Service Worker registration failed:", error);
                });
        });
    }
}

const root = document.getElementById("root")!;
ReactDOM.createRoot(root).render(
    <ErrorBoundary>
        <ThemeProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="*" element={<NginxAutoIndex/>}/>
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    </ErrorBoundary>,
);
