import CloudCircleIcon from "@mui/icons-material/CloudCircle";
import {AppBar, Button, Container, IconButton, Paper, Skeleton, Toolbar, Typography} from "@mui/material";
import {lazy, Suspense} from "react";
import {NginxFile} from "./file-parser";
import FileTable from "./FileTable";
import {useColorMode, useColorModeIcon} from "./theme";

const Readme = lazy(() => import("./Readme"))

interface NginxAutoIndexProps {
    files: NginxFile[];
}

function NginxAutoIndex({files}: NginxAutoIndexProps) {
    const {toggleColorMode} = useColorMode();
    const colorModeIcon = useColorModeIcon();

    const readme = files.find(file => /\/readme\.md$/i.test(file.href || ""))

    return (
        <>
            <AppBar position="fixed" sx={{zIndex: theme => theme.zIndex.appBar, flexGrow: 0}}>
                <Toolbar>
                    <CloudCircleIcon sx={{mr: 2}}/>
                    <div style={{flexGrow: 1}}>
                        <Button color="inherit" href="/">
                            <Typography component="h1" sx={{flexGrow: 1, userSelect: "none"}}>
                                {window.siteConfig?.name || "文件分享"}
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
                {window.siteConfig?.readme && window.siteConfig.before && readme && (
                    <Suspense fallback={<Skeleton variant="rounded" height={160} sx={{mb: 3}} animation="wave"/>}>
                        <Readme url={readme.href!}/>
                    </Suspense>
                )}
                <Paper sx={{minHeight: 200, mb: 3}}>
                    <FileTable files={files}/>
                </Paper>
                {window.siteConfig?.readme && !window.siteConfig.before && readme && (
                    <Suspense fallback={<Skeleton variant="rounded" height={160} sx={{mb: 3}} animation="wave"/>}>
                        <Readme url={readme.href!}/>
                    </Suspense>
                )}
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
