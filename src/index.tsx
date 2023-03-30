import React from "react";
import ReactDOM from "react-dom/client";
import "./default.css";
import ErrorBoundary from "./ErrorBoundary";
import NginxAutoIndex from "./NginxAutoIndex";
import {ThemeProvider} from "./theme";

declare global {
    interface Window {
        siteConfig?: {
            name?: string,
            title?: string,
            footer?: string,
            readme?: boolean,
            before?: boolean,
        };
    }
}
if (!window.siteConfig) {
    window.siteConfig = {}
}
window.siteConfig.name = window.siteConfig.name || "文件分享"
window.siteConfig.title = window.siteConfig.title || window.siteConfig.name
document.title = window.siteConfig.title

export interface NginxFile {
    name: string;
    href: string | null;
    date: Date | null;
    size: string;
}

const files: Array<NginxFile> = (function () {
    const files = [];
    let element = document.querySelector("pre > a:nth-child(2)") as (ChildNode | null | undefined);
    while (element) {
        let name, href, date, size;
        if (element instanceof HTMLAnchorElement) {
            name = element.innerText.replace(/^\.[\\/]+/, "");
            href = new URL(element.href).pathname;
        }
        element = element.nextSibling;
        if (element instanceof Text) {
            const [d, s] = element.data.trim().split(/\s\s+/);
            date = new Date(d) || null;
            size = s;
        }
        name = name || "未知名称";
        href = href || null;
        date = date || null;
        size = size || "-";
        files.push({name, href, date, size});
        element = element?.nextSibling;
    }
    document.body.innerHTML = "";
    return files;
})();

const root = document.createElement("div");
root.id = "root";
document.body.appendChild(root);
ReactDOM.createRoot(root).render(
    <ErrorBoundary>
        <ThemeProvider>
            <NginxAutoIndex files={files}/>
        </ThemeProvider>
    </ErrorBoundary>,
);
document.body.style.display = "block";

if (module && module.hot) {
    module.hot.accept();
}
