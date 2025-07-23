import SystemModeIcon from "@mui/icons-material/BrightnessAuto";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import {createTheme, CssBaseline, LinkProps, ThemeProvider as MuiThemeProvider} from "@mui/material";
import {createContext, forwardRef, PropsWithChildren, useContext, useEffect, useState} from "react";
import {Link as RouterLink, LinkProps as RouterLinkProps} from "react-router-dom";

export const LinkBehavior = forwardRef<
    HTMLAnchorElement,
    Omit<RouterLinkProps, "to"> & { href: RouterLinkProps["to"] }
>((props, ref) => {
    const {href, ...other} = props;
    return <RouterLink ref={ref} to={href} {...other} />;
});

export const Colors = {
    Purple: {
        primary: "#673ab7",
        secondary: "#ec4899",
        text: "#ffffff",
        dark: "#4917a3",
    },
    Blue: {
        primary: "#0088cc",
        secondary: "#66ccff",
        text: "#ffffff",
        dark: "#005f8f",
    },
    Green: {
        primary: "#2d8454",
        secondary: "#03dac6",
        text: "#ffffff",
        dark: "#00562b",
    },
    Pink: {
        primary: "#f43098",
        secondary: "#ab44ff",
        text: "#ffffff",
        dark: "#a1005c",
    }
};
export type Color = keyof typeof Colors;
const ColorNames = Object.keys(Colors) as Color[];

export type ColorMode = "light" | "dark" | "system";
export type SystemColorMode = "light" | "dark"

const local = localStorage.getItem("theme.palette.mode") || "system";
const defaultMode = local === "light" || local === "dark" ? local : "system";
const defaultSystem = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
const localColor = (localStorage.getItem("theme.palette.color") || "Purple") as Color;
const defaultLocalColor = ColorNames.includes(localColor) ? localColor : "Purple";

type ColorModeContextType = {
    currentColorMode: SystemColorMode;
    systemColorMode: SystemColorMode;
    toggleColorMode: () => void;
    colorMode: ColorMode;
    setColorMode: (mode: ColorMode) => void;
    color: Color;
    setColor: (color: Color) => void;
}

export const ColorModeContext = createContext<ColorModeContextType>(undefined!);

export function useColorMode() {
    return useContext(ColorModeContext);
}

type ThemeProviderProps = PropsWithChildren;

export function ThemeProvider({children}: ThemeProviderProps) {
    const [colorMode, _setColorMode] = useState<ColorMode>(defaultMode);
    const [systemColorMode, setSystemColorMode] = useState<SystemColorMode>(defaultSystem);
    const [color, _setColor] = useState<Color>(defaultLocalColor);
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
        if (colorMode === "light") {
            setColorMode("dark");
        } else if (colorMode === "dark") {
            setColorMode("system");
        } else {
            setColorMode("light");
        }
    };
    const setColor = (mode: Color) => {
        _setColor(mode);
        localStorage.setItem("theme.palette.color", mode);
    }
    const currentColorMode = colorMode === "system" ? systemColorMode : colorMode;
    useEffect(() => {
        if (document.documentElement.style.colorScheme !== currentColorMode) {
            document.documentElement.style.colorScheme = currentColorMode;
        }
        if (colorMode === "system") {
            document.documentElement.classList.remove("dark", "light");
        }
        if (colorMode === "dark") {
            document.documentElement.classList.add("dark");
            document.documentElement.classList.remove("light");
        }
        if (colorMode === "light") {
            document.documentElement.classList.add("light");
            document.documentElement.classList.remove("dark");
        }
    }, [currentColorMode, colorMode]);
    const theme = createTheme({
        palette: {
            mode: currentColorMode,
            primary: {
                main: Colors[color].primary,
            },
            secondary: {
                main: Colors[color].secondary,
            },
        },
        components: {
            MuiLink: {
                defaultProps: {
                    component: LinkBehavior,
                } as LinkProps,
            },
            MuiButtonBase: {
                defaultProps: {
                    LinkComponent: LinkBehavior,
                },
            },
        },
    });

    const value = {
        colorMode,
        currentColorMode,
        systemColorMode,
        setColorMode,
        toggleColorMode,
        color,
        setColor,
    }

    return (
        <ColorModeContext.Provider value={value}>
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
