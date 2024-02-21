import CloseIcon from "@mui/icons-material/Close";
import SettingsIcon from "@mui/icons-material/Settings";
import {
    AppBar,
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
    Theme,
    Toolbar,
    Typography,
    useMediaQuery,
} from "@mui/material";
import {TransitionProps} from "@mui/material/transitions";
import {forwardRef, ReactElement, Ref, useEffect, useState} from "react";
import {OrderConfig} from "./FileTable";

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
    const fullScreen = useMediaQuery<Theme>(theme => theme.breakpoints.down("md"));
    const [isOpen, setIsOpen] = useState(false);
    const [wideMode, setWideMode] = useState(settings.wideMode);
    const [orderGroupBy, setOrderGroupBy] = useState(orderConfig.groupBy);

    useEffect(() => {
        setWideMode(settings.wideMode);
        setOrderGroupBy(orderConfig.groupBy);
    }, [settings.orderConfig]);

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
                TransitionComponent={Transition}>
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
                </DialogContent>
                <DialogActions>
                    <Grid container spacing={2} sx={{p: 2}}>
                        <Grid item xs={6}>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleSave}>
                                确定
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
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
