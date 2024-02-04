import React from "react";
import ReactDOM from "react-dom/client";
import "./default.css";
import ErrorBoundary from "./ErrorBoundary";
import fileParser from "./file-parser";
import NginxAutoIndex from "./NginxAutoIndex";
import {ThemeProvider} from "./theme";

declare global {
    interface Window {
        siteConfig?: {
            name?: string,
            title?: string,
            footer?: string,
            readme?: boolean | string,
            before?: boolean,
        };
    }
}
if (!window.siteConfig) {
    window.siteConfig = {};
}
window.siteConfig.name ??= "文件分享";
window.siteConfig.title ??= window.siteConfig.name;
document.title = window.siteConfig.title;

const metadata = fileParser(document.documentElement as HTMLHtmlElement);
document.body.innerHTML = "";

const root = document.createElement("div");
root.id = "root";
document.body.appendChild(root);
ReactDOM.createRoot(root).render(
    <ErrorBoundary>
        <ThemeProvider>
            <NginxAutoIndex metadata={metadata}/>
        </ThemeProvider>
    </ErrorBoundary>,
);
document.body.style.display = "block";

if (module && module.hot) {
    module.hot.accept();
}
