import CloudCircleIcon from "@mui/icons-material/CloudCircle";
import {AppBar, Button, Container, IconButton, Paper, Skeleton, Toolbar, Typography} from "@mui/material";
import {lazy, MouseEventHandler, Suspense, useCallback, useEffect, useState} from "react";
import {flushSync} from "react-dom";
import {useLocation, useNavigate} from "react-router";
import fileParser, {NginxFile} from "./file-parser";
import FileTable from "./FileTable";
import {useColorMode, useColorModeIcon} from "./theme";

const Readme = lazy(() => import("./Readme"));

async function fetchNewPage(url: string) {
    try {
        const head = await fetch(url, {method: "HEAD"});
        if (!head.ok || !head.headers.get("Content-Type")?.match(/text\/html/i)) return null;
        const res = await fetch(url);
        const html = await res.text();

        const doc = new DOMParser().parseFromString(html, "text/html");
        if (!doc.title.includes("Index of")) {
            return null;
        }
        return doc
    } catch (e) {
        return null;
    }
}

function NginxAutoIndex() {
    const location = useLocation();
    const navigate = useNavigate();
    const [files, setFiles] = useState<NginxFile[]>([]);
    const {colorMode, systemColorMode, toggleColorMode} = useColorMode();
    const colorModeIcon = useColorModeIcon();

    const readme = files.find(file => /\/readme\.md$/i.test(file.href || ""));

    useEffect(() => {
        (async () => {
            const newPage = await fetchNewPage(location.pathname);
            if (!newPage) {
                // 如果获取失败，新建页面以播放/下载
                const a = document.createElement("a");
                a.href = location.pathname;
                a.target = "_blank";
                a.click();
                navigate(-1);
                return;
            }
            const newFiles = fileParser(location.pathname, newPage.documentElement as HTMLHtmlElement);
            setFiles(newFiles);
            const prefix = location.pathname === "" ? "" : `${location.pathname} - `;
            document.title = `${prefix}${window.siteConfig!.title}`;
        })();
    }, [location.pathname]);

    const handleToggleColorMode = useCallback<MouseEventHandler>(async (e) => {
        if (!("startViewTransition" in document)) {
            toggleColorMode();
            return;
        }
        // 跳过颜色不变
        if (colorMode === "dark" && colorMode === systemColorMode) {
            // dark -> system (dark)
            toggleColorMode();
            return;
        }
        if (colorMode === "system" && systemColorMode === "light") {
            // system(light) -> light
            toggleColorMode();
            return;
        }
        const x = e.clientX;
        const y = e.clientY;
        const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

        const vt = document.startViewTransition(() => {
            flushSync(() => {
                toggleColorMode();
            });
        });
        await vt.ready;
        const duration = 200;
        if (colorMode === "light") {
            const frameConfig = {
                clipPath: [
                    `circle(0 at ${x}px ${y}px)`,
                    `circle(${radius}px at ${x}px ${y}px)`,
                ],
            };
            const timingConfig = {
                duration: duration,
                pseudoElement: "::view-transition-new(root)",
            };
            document.documentElement.animate(frameConfig, timingConfig);
        } else {
            const frameConfig = {
                clipPath: [
                    `circle(${radius}px at ${x}px ${y}px)`,
                    `circle(0 at ${x}px ${y}px)`,
                ],
                zIndex: [10, 10],
            };
            const timingConfig = {
                duration: duration,
                pseudoElement: "::view-transition-old(root)",
            };
            document.documentElement.animate(frameConfig, timingConfig);
        }
    }, [colorMode, toggleColorMode]);

    const readmeElement = window.siteConfig!.readme! && readme && (
        <Suspense fallback={<Skeleton variant="rounded" height={320} sx={{mb: 3}} animation="wave"/>}>
            <Readme url={readme.href!}/>
        </Suspense>
    );

    return (
        <>
            <AppBar position="fixed" sx={{zIndex: theme => theme.zIndex.appBar, flexGrow: 0}}>
                <Toolbar>
                    <CloudCircleIcon sx={{mr: 2}}/>
                    <div style={{flexGrow: 1}}>
                        <Button color="inherit" href="/">
                            <Typography component="h1" sx={{flexGrow: 1, userSelect: "none"}}>
                                {window.siteConfig!.name!}
                            </Typography>
                        </Button>
                    </div>
                    <IconButton color="inherit" sx={{mr: 2}} onClick={handleToggleColorMode}>
                        {colorModeIcon}
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Container component="main" sx={{mt: 2, flexGrow: 1}}>
                <Toolbar/>
                {window.siteConfig!.before && readmeElement}
                <Paper sx={{mb: 3}}>
                    <FileTable files={files}/>
                </Paper>
                {!window.siteConfig!.before && readmeElement}
            </Container>
            {window.siteConfig?.footer && (
                <Paper component="footer" sx={{py: 4}}>
                    <Typography textAlign="center"
                                variant="body1"
                                component="p">
                        {window.siteConfig?.footer}
                    </Typography>
                </Paper>
            )}
        </>
    );
}

export default NginxAutoIndex;
