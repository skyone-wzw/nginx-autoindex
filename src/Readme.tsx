import {Card, CardHeader, CardMedia, Paper, Skeleton} from "@mui/material";
import hljs from "highlight.js";
import {useEffect, useRef, useState} from "react";
import rehypeMathJaxSvg from "rehype-mathjax";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import {unified} from "unified/lib";
import {useColorMode} from "./theme";
import "./markdown.css";

async function markdownParser(markdown: string) {
    const content = String(
        await unified()
            .use(remarkParse)
            .use(remarkGfm)
            .use(remarkMath)
            .use(remarkRehype, {allowDangerousHtml: true})
            .use(rehypeRaw)
            .use(rehypeMathJaxSvg)
            .use(rehypeStringify)
            .process(markdown),
    );
    if (!content) throw new Error();
    return content;
}

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
            const markdown = await fetch(url).then(res => {
                if (/text\/html/.test(res.headers.get("Content-Type") || "")) {
                    return ""
                }
                return res.text()
            });
            // 没有 README.md
            if (!markdown) {
                setLoading(false)
                return;
            }
            try {
                const html = await markdownParser(markdown);
                setContent(html);
            } catch (e) {
                console.log(e)
                setError(true);
                return;
            }
        })();
    }, [url]);

    useEffect(() => {
        if (!loading && ref.current && content) {
            ref.current.innerHTML = content;
            ref.current.querySelectorAll(`pre code[class^="language-"]`).forEach((el) => {
                hljs.highlightElement(el as any);
            });
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
        return <></>
    }

    return (
        <Paper sx={{minHeight: 240, mb: 3, p: 4}}>
            <link rel="stylesheet" href={`/nginx-autoindex/github-${currentColorMode}.min.css`}/>
            <div className={`markdown-body markdown-${currentColorMode}`} ref={ref}/>
        </Paper>
    );
}

export default Readme;
