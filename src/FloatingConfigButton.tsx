import {Fingerprint} from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import SettingsIcon from "@mui/icons-material/Settings";
import {
    AppBar,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    Fab,
    FormControlLabel,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Slide,
    Switch,
    Toolbar,
    Typography,
    useMediaQuery,
} from "@mui/material";
import {TransitionProps} from "@mui/material/transitions";
import {forwardRef, MouseEvent as ReactMouseEvent, ReactElement, Ref, useEffect, useState} from "react";
import {flushSync} from "react-dom";
import {OrderConfig} from "./FileTable";
import {Colors, useColorMode} from "./theme";

const Transition = forwardRef(function Transition(
    props: TransitionProps & {
        children: ReactElement<any, any>;
    },
    ref: Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} children={props.children}/>;
});

interface Settings {
    wideMode: boolean;
    orderConfig: OrderConfig;
}

interface FloatingConfigButtonProps {
    settings: Settings;
    setSettings: (settings: Settings) => void;
}

function FloatingConfigButton({settings, setSettings}: FloatingConfigButtonProps) {
    const {orderConfig} = settings;
    const {color, setColor} = useColorMode();
    const fullScreen = useMediaQuery(theme => theme.breakpoints.down("md"));
    const [isOpen, setIsOpen] = useState(false);
    const [wideMode, setWideMode] = useState(settings.wideMode);
    const [orderGroupBy, setOrderGroupBy] = useState(orderConfig.groupBy);

    useEffect(() => {
        setWideMode(settings.wideMode);
        setOrderGroupBy(orderConfig.groupBy);
    }, [settings.orderConfig]);

    const handleSetColor = (next: keyof typeof Colors) => async (e: ReactMouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (next === color) {
            return;
        }
        if (!("startViewTransition" in document)) {
            setColor(next);
            return;
        }
        const x = e.clientX;
        const y = e.clientY;
        const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

        const vt = document.startViewTransition(() => {
            flushSync(() => {
                setColor(next);
            });
        });
        await vt.ready;
        const duration = 200;
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
    };

    const handleSave = () => {
        const newOrderConfig = {...orderConfig, groupBy: orderGroupBy};
        setSettings({...settings, orderConfig: newOrderConfig, wideMode});
        setIsOpen(false);
    };

    return (
        <>
            <Fab
                sx={{position: "fixed", bottom: 32, right: 32}}
                color="primary" aria-label="settings"
                onClick={() => setIsOpen(true)}>
                <SettingsIcon/>
            </Fab>
            <Dialog
                open={isOpen}
                maxWidth="sm"
                fullWidth
                keepMounted
                scroll="paper"
                fullScreen={fullScreen}
                slots={{
                    transition: Transition,
                }}>
                <AppBar sx={{position: "relative"}}>
                    <Toolbar>
                        <Typography sx={{ml: 1, flex: 1}} variant="h6" component="div">
                            设置
                        </Typography>
                        <IconButton
                            edge="end"
                            color="inherit"
                            onClick={() => setIsOpen(false)}
                        >
                            <CloseIcon/>
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <DialogContent>
                    <FormControlLabel sx={{mb: 2}} label="宽模式"
                                      control={
                                          <Switch
                                              checked={wideMode}
                                              onChange={e => setWideMode(e.target.checked)}/>
                                      }/>
                    <InputLabel id="settings-order-orderGroupBy-label">分组</InputLabel>
                    <Select
                        fullWidth
                        labelId="settings-order-orderGroupBy-label"
                        id="settings-order-orderGroupBy"
                        value={orderGroupBy}
                        label="分组"
                        onChange={e => setOrderGroupBy(e.target.value as OrderConfig["groupBy"])}
                    >
                        <MenuItem value="none">不分组</MenuItem>
                        <MenuItem value="type">按文件夹和文件分组</MenuItem>
                        <MenuItem value="ext">按拓展名分组</MenuItem>
                    </Select>
                    <Typography component="p" variant="subtitle1" gutterBottom sx={{mt: 2}}>主题颜色</Typography>
                    <Box sx={{display: "flex", gap: 1}}>
                        {Object.keys(Colors).map((key) => (
                            <IconButton key={key} size="large"
                                        sx={{
                                            backgroundColor: Colors[key as keyof typeof Colors].primary,
                                            color: Colors[key as keyof typeof Colors].text,
                                            ":hover": {
                                                backgroundColor: Colors[key as keyof typeof Colors].dark,
                                            },
                                        }}
                                        onClick={handleSetColor(key as keyof typeof Colors)}>
                                <Fingerprint/>
                            </IconButton>
                        ))}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Grid container spacing={2} sx={{p: 2}}>
                        <Grid size={{xs: 6}}>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleSave}>
                                确定
                            </Button>
                        </Grid>
                        <Grid size={{xs: 6}}>
                            <Button
                                fullWidth
                                variant="outlined"
                                color="error"
                                onClick={() => setIsOpen(false)}>
                                取消
                            </Button>
                        </Grid>
                    </Grid>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default FloatingConfigButton;
