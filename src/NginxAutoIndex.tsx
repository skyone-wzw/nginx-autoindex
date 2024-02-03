import BrightnessAutoIcon from "@mui/icons-material/BrightnessAuto";
import CloudCircleIcon from "@mui/icons-material/CloudCircle";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import {AppBar, Button, Container, IconButton, Paper, Skeleton, Toolbar, Typography} from "@mui/material";
import {lazy, Suspense} from "react";
import FileTable from "./FileTable";
import {NginxFile} from "./index";
import {useColorMode} from "./theme";

const Readme = lazy(() => import("./Readme"))

interface NginxAutoIndexProps {
    files: Array<NginxFile>;
}

function NginxAutoIndex({files}: NginxAutoIndexProps) {
    const {colorMode, setColorMode} = useColorMode();
    const colorModeIcon = colorMode === "light" ? <LightModeIcon/> :
        colorMode === "dark" ? <DarkModeIcon/> : <BrightnessAutoIcon/>;
    const colorModeToggle = () => {
        if (colorMode === "light") {
            setColorMode("dark");
        } else if (colorMode === "dark") {
            setColorMode("system");
        } else {
            setColorMode("light");
        }
    };
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
                    <IconButton color="inherit" sx={{mr: 2}} onClick={colorModeToggle}>
                        {colorModeIcon}
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Container component="main" sx={{mt: 2, gridRowStart: 1}}>
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
                <Paper component="footer" sx={{gridRowStart: 2, py: 4}}>
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
