import {Card, CardHeader, CardMedia, Paper, Skeleton} from "@mui/material";
import {useEffect, useRef, useState} from "react";
import "./markdown.css";
import "./github.min.css";
import {useColorMode} from "./theme";
import "katex/dist/katex.css";

interface ReadmeProps {
    url: string;
}

function Readme({url}: ReadmeProps) {
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState("");
    const [error, setError] = useState(false);
    const {currentColorMode} = useColorMode();
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        (async () => {
            let render: (markdown: string) => Promise<string>;
            if (typeof window.siteConfig?.readme === "string") {
                const server = window.siteConfig.readme;
                render = markdown =>
                    fetch(server, {
                        method: "POST",
                        mode: "cors",
                        body: markdown,
                        headers: {
                            "Content-Type": "text/plain",
                        },
                    }).then(res => res.text());
            } else {
                render = (await import("./render")).default;
            }
            const markdown = await fetch(url).then(res => {
                if (/text\/html/.test(res.headers.get("Content-Type") || "")) {
                    return "";
                }
                return res.text();
            });
            // 没有 README.md
            if (!markdown) {
                setLoading(false);
                return;
            }
            try {
                const html = await render(markdown);
                setContent(html);
            } catch (e) {
                console.log(e);
                setError(true);
                return;
            }
        })();
    }, [url]);

    useEffect(() => {
        if (!loading && ref.current && content) {
            ref.current.innerHTML = content;
        }
    }, [content]);

    // 未知错误
    if (error) {
        return (
            <Card sx={{mb: 3}}>
                <CardHeader title="Readme 加载失败"/>
                <CardMedia component="img" image="/nginx-autoindex/error.webp" alt="Readme 加载失败"/>
            </Card>
        );
    }
    // 加载中
    if (loading) {
        return <Skeleton variant="rounded" sx={{mb: 3}} height={160} animation="wave"/>;
    }
    // 没有 README.md
    if (!content) {
        return <></>;
    }

    return (
        <Paper sx={{minHeight: 240, mb: 3, p: 4}}>
            <div className={`markdown-body markdown-${currentColorMode}`} ref={ref}/>
        </Paper>
    );
}

export default Readme;
