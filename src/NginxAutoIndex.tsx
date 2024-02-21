import CloudCircleIcon from "@mui/icons-material/CloudCircle";
import {AppBar, Button, Container, IconButton, Paper, Skeleton, Toolbar, Typography} from "@mui/material";
import {lazy, Suspense, useEffect, useState} from "react";
import {useLocation} from "react-router";
import fileParser, {NginxFile} from "./file-parser";
import FileTable from "./FileTable";
import {useColorMode, useColorModeIcon} from "./theme";

const Readme = lazy(() => import("./Readme"));

async function fetchNewPage(url: string) {
    try {
        const res = await fetch(url);
        if (!res.ok || !res.headers.get("Content-Type")?.match(/text\/html/i)) return null;
        const html = await res.text();
        const parser = new DOMParser();
        return parser.parseFromString(html, "text/html");
    } catch (e) {
        return null;
    }
}

function NginxAutoIndex() {
    const location = useLocation();
    const [files, setFiles] = useState<NginxFile[]>([]);
    const {toggleColorMode} = useColorMode();
    const colorModeIcon = useColorModeIcon();

    const readme = files.find(file => /\/readme\.md$/i.test(file.href || ""));

    useEffect(() => {
        (async () => {
            const newPage = await fetchNewPage(location.pathname);
            if (!newPage) {
                // 如果获取失败，直接跳转
                window.location.href = location.pathname;
                return;
            }
            const newFiles = fileParser(location.pathname, newPage.documentElement as HTMLHtmlElement);
            setFiles(newFiles);
            const prefix = location.pathname === "" ? "" : `${location.pathname} - `;
            document.title = `${prefix}${window.siteConfig!.title}`;
        })()
    }, [location.pathname]);

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
                    <IconButton color="inherit" sx={{mr: 2}} onClick={toggleColorMode}>
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
