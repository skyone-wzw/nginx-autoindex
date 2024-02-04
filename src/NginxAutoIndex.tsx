import CloudCircleIcon from "@mui/icons-material/CloudCircle";
import {AppBar, Button, Container, IconButton, Paper, Skeleton, Toolbar, Typography} from "@mui/material";
import {lazy, Suspense, useEffect, useState} from "react";
import fileParser, {NginxPageMetadata} from "./file-parser";
import FileTable from "./FileTable";
import {useColorMode, useColorModeIcon} from "./theme";

const Readme = lazy(() => import("./Readme"));

async function fetchNewPage(url: string) {
    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const html = await res.text();
        const parser = new DOMParser();
        return parser.parseFromString(html, "text/html");
    } catch (e) {
        return null;
    }
}

interface NginxAutoIndexProps {
    metadata: NginxPageMetadata;
}

function NginxAutoIndex({metadata}: NginxAutoIndexProps) {
    const [path, setPath] = useState(metadata.path);
    const [files, setFiles] = useState(metadata.files);
    const {toggleColorMode} = useColorMode();
    const colorModeIcon = useColorModeIcon();

    const readme = files.find(file => /\/readme\.md$/i.test(file.href || ""));

    useEffect(() => {
        const prefix = path === "" ? "" : `${path} - `;
        document.title = `${prefix}${window.siteConfig!.title!}`;
    }, [path]);

    const handleNewPage = async (url: string) => {
        const newPage = await fetchNewPage(url);
        if (!newPage) {
            // 如果获取失败，直接跳转
            window.location.href = url;
            return;
        }
        history.pushState(null, "", url);
        window.scroll({top: 0, behavior: "smooth"});
        const newMetadata = fileParser(newPage.documentElement as HTMLHtmlElement);
        setPath(newMetadata.path);
        setFiles(newMetadata.files);
    };

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
                            <Typography component="h1" sx={{flexGrow: 1, userSelect: "none"}}
                                        onClick={() => handleNewPage("/")}>
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
                    <FileTable files={files} handleNewPage={handleNewPage}/>
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
