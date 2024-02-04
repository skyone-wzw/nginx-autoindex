import SystemModeIcon from "@mui/icons-material/BrightnessAuto";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import {createTheme, CssBaseline, ThemeProvider as MuiThemeProvider} from "@mui/material";
import {createContext, PropsWithChildren, useContext, useEffect, useState} from "react";

export type ColorMode = "light" | "dark" | "system";
export type SystemColorMode = "light" | "dark"

const local = localStorage.getItem("theme.palette.mode") || "system";
const defaultMode = local === "light" || local === "dark" ? local : "system";
const defaultSystem = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

type ColorModeContextType = {
    currentColorMode: SystemColorMode;
    toggleColorMode: () => void;
    colorMode: ColorMode;
    setColorMode: (mode: ColorMode) => void;
}

export const ColorModeContext = createContext<ColorModeContextType>(null!);

export function useColorMode() {
    return useContext(ColorModeContext);
}

type ThemeProviderProps = PropsWithChildren;

export function ThemeProvider({children}: ThemeProviderProps) {
    const [colorMode, _setColorMode] = useState<ColorMode>(defaultMode);
    const [systemColorMode, setSystemColorMode] = useState<SystemColorMode>(defaultSystem);
    useEffect(() => {
        const listener = (e: MediaQueryListEvent) => {
            setSystemColorMode(e.matches ? "dark" : "light");
        };
        window.matchMedia("(prefers-color-scheme: dark)")
            .addEventListener("change", listener);
        return () => {
            window.matchMedia("(prefers-color-scheme: dark)")
                .removeEventListener("change", listener);
        };
    }, []);
    const setColorMode = (mode: ColorMode) => {
        _setColorMode(mode);
        localStorage.setItem("theme.palette.mode", mode);
    };
    const toggleColorMode = () => {
        _setColorMode(prev => {
            if (prev === "light") {
                return "dark";
            } else if (prev === "dark") {
                return "system";
            } else {
                return "light";
            }
        });
    };
    const currentColorMode = colorMode === "system" ? systemColorMode : colorMode;
    useEffect(() => {
        if (document.documentElement.style.colorScheme !== currentColorMode) {
            document.documentElement.style.colorScheme = currentColorMode;
        }
    }, [currentColorMode]);
    const theme = createTheme({
        zIndex: {
            drawer: 1200,
            appBar: 1201,
        },
        palette: {
            mode: currentColorMode,
            primary: {
                main: "#673ab7",
            },
            secondary: {
                main: "#ec4899",
            },
        },
    });

    return (
        <ColorModeContext.Provider value={{colorMode, currentColorMode, setColorMode, toggleColorMode}}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline/>
                {children}
            </MuiThemeProvider>
        </ColorModeContext.Provider>
    );
}

export function useColorModeIcon() {
    const {colorMode} = useColorMode();

    switch (colorMode) {
        case "light":
            return <LightModeIcon/>;
        case "dark":
            return <DarkModeIcon/>;
        default:
            return <SystemModeIcon/>;
    }
}
