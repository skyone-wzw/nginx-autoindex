import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import MusicFileIcon from "@mui/icons-material/MusicNote";
import ImageFileIcon from "@mui/icons-material/Photo";
import VideoFileIcon from "@mui/icons-material/VideoFile";
import {
    Box,
    FormControlLabel,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Toolbar,
    Typography,
    useMediaQuery,
} from "@mui/material";
import {visuallyHidden} from "@mui/utils";
import {useState} from "react";
import {NginxFile} from "./file-parser";
import FloatingConfigButton from "./FloatingConfigButton";

function humanFileSize(bytes: number, si = false, dp = 1) {
    const thresh = si ? 1000 : 1024;
    if (Math.abs(bytes) < thresh) {
        return bytes + " B";
    }
    const units = si
        ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
        : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
    let u = -1;
    const r = 10 ** dp;
    do {
        bytes /= thresh;
        ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
    return bytes.toFixed(dp) + " " + units[u];
}

function getFileIcon(filename: string) {
    if (filename.endsWith("/")) {
        return <FolderIcon/>;
    }
    if (/\.(png|jpe?g|gif|webp|bmp)$/.test(filename)) {
        return <ImageFileIcon/>;
    }
    if (/\.(mp3|ape|flac|ogg|wav|wma|aac)$/.test(filename)) {
        return <MusicFileIcon/>;
    }
    if (/\.(mp4|flv|m4v|mkv|avi|webm|rmvb)$/.test(filename)) {
        return <VideoFileIcon/>;
    }
    return <InsertDriveFileIcon/>;
}

type Order = "asc" | "desc";
type OrderBy = "filename" | "changetime" | "filesize"
type OrderGroupBy = "none" | "type" | "ext"

export interface OrderConfig {
    order: Order;
    orderBy: OrderBy;
    groupBy: OrderGroupBy;
}

const DefaultOrderConfig: OrderConfig = {
    order: "asc",
    orderBy: "filename",
    groupBy: "type",
};

interface EnhancedTableProps {
    orderConfig: OrderConfig;
    setOrderConfig: (config: OrderConfig) => void;
}

function EnhancedTableHead({orderConfig, setOrderConfig}: EnhancedTableProps) {
    const {order, orderBy, groupBy} = orderConfig;

    const changeOrder = (newOrderBy: OrderBy) => {
        if (newOrderBy === orderBy) {
            const newOrder = order === "asc" ? "desc" : "asc";
            setOrderConfig({order: newOrder, orderBy: newOrderBy, groupBy});
        } else {
            setOrderConfig({order: "asc", orderBy: newOrderBy, groupBy});
        }
    };

    return (
        <TableHead>
            <TableRow>
                <TableCell align="right" padding="checkbox"/>
                <TableCell align="left" sortDirection={order}>
                    <TableSortLabel
                        active={orderBy === "filename"}
                        direction={order}
                        onClick={() => changeOrder("filename")}
                    >
                        文件名
                        {orderBy === "filename" && (
                            <Box component="span" sx={visuallyHidden}>
                                {order === "desc" ? "倒序" : "顺序"}
                            </Box>
                        )}
                    </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                    <TableSortLabel
                        active={orderBy === "filesize"}
                        direction={order}
                        onClick={() => changeOrder("filesize")}
                    >
                        大小
                        {orderBy === "filesize" && (
                            <Box component="span" sx={visuallyHidden}>
                                {order === "desc" ? "倒序" : "顺序"}
                            </Box>
                        )}
                    </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                    <TableSortLabel
                        active={orderBy === "changetime"}
                        direction={order}
                        onClick={() => changeOrder("changetime")}
                    >
                        修改时间
                        {orderBy === "changetime" && (
                            <Box component="span" sx={visuallyHidden}>
                                {order === "desc" ? "倒序" : "顺序"}
                            </Box>
                        )}
                    </TableSortLabel>
                </TableCell>
            </TableRow>
        </TableHead>
    );
}

function filenameComparator(a: NginxFile, b: NginxFile, order: Order) {
    if (order === "asc") {
        return a.name > b.name ? 1 : -1;
    } else {
        return a.name > b.name ? -1 : 1;
    }
}

function filesizeComparator(a: NginxFile, b: NginxFile, order: Order) {
    // 文件夹以 0 处理
    const sizeA = a.size ?? 0;
    const sizeB = b.size ?? 0;
    if (sizeA === sizeB) {
        // 两者大小相等，按文件名排序
        return filenameComparator(a, b, order);
    }
    if (order === "asc") {
        return sizeA - sizeB;
    } else {
        return sizeB - sizeA;
    }
}

function changetimeComparator(a: NginxFile, b: NginxFile, order: Order) {
    // 文件夹以 0 处理
    const timeA = a.date?.getTime() ?? 0;
    const timeB = b.date?.getTime() ?? 0;
    if (timeA === timeB) {
        // 两者时间相等，按文件名排序
        return filenameComparator(a, b, order);
    }
    if (order === "asc") {
        return timeA - timeB;
    } else {
        return timeB - timeA;
    }
}

const makeComparator = (fn: (a: NginxFile, b: NginxFile, order: Order) => number) => (order: Order) => (a: NginxFile, b: NginxFile) => fn(a, b, order);

const comparators: { [T in OrderBy]: (order: Order) => (a: NginxFile, b: NginxFile) => number } = {
    filename: makeComparator(filenameComparator),
    filesize: makeComparator(filesizeComparator),
    changetime: makeComparator(changetimeComparator),
};

function sort(data: NginxFile[], config: OrderConfig): NginxFile[] {
    const {order, orderBy, groupBy} = config;

    if (groupBy === "none") {
        // 不分组
        return [...data].sort(comparators[orderBy](order));
    } else if (groupBy === "ext") {
        // 按文件扩展名分组
        const result = [];
        const dirs = data.filter(f => f.name.endsWith("/"));
        const files = data.filter(f => !f.name.endsWith("/"));
        result.push(...dirs.sort(comparators[orderBy](order)));
        const extMap = new Map<string, NginxFile[]>();
        for (const f of files) {
            const ext = f.name.split(".").pop() ?? "";
            if (!extMap.has(ext)) {
                extMap.set(ext, []);
            }
            extMap.get(ext)!.push(f);
        }
        Array.from(extMap.keys()).sort().forEach(ext => {
            result.push(...extMap.get(ext)!.sort(comparators[orderBy](order)));
        });
        return result;
    } else {
        // 文件夹在前
        const result = [];
        result.push(...data.filter(f => f.name.endsWith("/")).sort(comparators[orderBy](order)));
        result.push(...data.filter(f => !f.name.endsWith("/")).sort(comparators[orderBy](order)));
        return result;
    }
}

function getLocalOrderConfig(): OrderConfig {
    const result = DefaultOrderConfig;
    try {
        const data = localStorage.getItem("orderConfig");
        if (data) {
            const config = JSON.parse(data);
            if (config.order === "asc" || config.order === "desc") {
                result.order = config.order;
            }
            if (config.orderBy === "filename" || config.orderBy === "filesize" || config.orderBy === "changetime") {
                result.orderBy = config.orderBy;
            }
            if (config.groupBy === "none" || config.groupBy === "type" || config.groupBy === "ext") {
                result.groupBy = config.groupBy;
            }
        }
    } catch (e) {
    }
    return result;
}

function setLocalOrderConfig(config: OrderConfig) {
    localStorage.setItem("settings.orderConfig", JSON.stringify(config));
}

function getLocalWideMode(): boolean {
    return localStorage.getItem("settings.wideMode") !== "false";
}

function setLocalWideMode(wideMode: boolean) {
    localStorage.setItem("settings.wideMode", wideMode.toString());
}

interface FileTableProps {
    handleNewPage: (url: string) => void;
    files: NginxFile[];
}

const minWide = 620;

function FileTable({handleNewPage, files}: FileTableProps) {
    const [orderConfig, _setOrderConfig] = useState<OrderConfig>(getLocalOrderConfig());
    const [wideMode, _setWideMode] = useState(getLocalWideMode());

    const setOrderConfig = (config: OrderConfig) => {
        _setOrderConfig(config);
        setLocalOrderConfig(config);
    };
    const setWideMode = (wideMode: boolean) => {
        _setWideMode(wideMode);
        setLocalWideMode(wideMode);
    };

    return (
        <>
            <TableContainer>
                <Table sx={wideMode ? {minWidth: minWide} : {}}>
                    <EnhancedTableHead orderConfig={orderConfig} setOrderConfig={setOrderConfig}/>
                    <TableBody>
                        {location.pathname !== "/" && (
                            <TableRow hover key="/index" sx={{cursor: "pointer"}}
                                      onClick={() => handleNewPage("../")}>
                                <TableCell align="right" padding="checkbox"/>
                                <TableCell align="left">
                                    {/* @ts-ignore */}
                                    <Typography href="../" sx={{color: "unset", textDecoration: "none"}}
                                                onClick={(e) => e.preventDefault()}
                                                variant="body1" component="a">返回上一级</Typography>
                                </TableCell>
                                <TableCell
                                    align="right"/>
                                <TableCell/>
                            </TableRow>
                        )}
                        {sort(files, orderConfig).map(file => {
                            const filesize = file.size;
                            const isDir = file.name.endsWith("/");
                            return (
                                <TableRow hover key={file.name} sx={{cursor: "pointer"}}
                                          onClick={() => {
                                              if (isDir) {
                                                  handleNewPage(file.href);
                                              } else {
                                                  window.location.href = file.href;
                                              }
                                          }}>
                                    <TableCell align="right" padding="checkbox">
                                        {getFileIcon(file.name)}
                                    </TableCell>
                                    <TableCell align="left">
                                        {/* @ts-ignore */}
                                        <Typography href={file.href} sx={{color: "unset", textDecoration: "none"}}
                                                    onClick={e => isDir && e.preventDefault()}
                                                    variant="body1" component="a">{file.name}</Typography>
                                    </TableCell>
                                    <TableCell
                                        align="right">{filesize !== null && humanFileSize(filesize!) || "-"}</TableCell>
                                    <TableCell
                                        align="right">{file.date?.toLocaleDateString().replace(/\b(\d)\b/g, "0$1")}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <FloatingConfigButton
                settings={{wideMode, orderConfig}}
                setSettings={settings => {
                    setWideMode(settings.wideMode);
                    setOrderConfig(settings.orderConfig)
                }}/>
        </>
    );
}

export default FileTable;
