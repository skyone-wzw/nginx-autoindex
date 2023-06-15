import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import PhotoIcon from "@mui/icons-material/Photo";
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
import {NginxFile} from "./index";

function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) {
            return order;
        }
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

function isNumber(obj: any) {
    return typeof obj === "number" && !isNaN(obj);
}

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

function isDir(filename: string) {
    return filename.endsWith("/");
}

function getFileIcon(filename: string) {
    if (filename.endsWith("/")) {
        return <FolderIcon/>;
    }
    if (/\.(png|jpe?g|gif|webp|bmp)$/.test(filename)) {
        return <PhotoIcon/>;
    }
    if (/\.(mp3|ape|flac|ogg|wav|wma|aac)$/.test(filename)) {
        return <MusicNoteIcon/>;
    }
    if (/\.(mp4|flv|m4v|mkv|avi|webm|rmvb)$/.test(filename)) {
        return <VideoFileIcon/>;
    }
    return <InsertDriveFileIcon/>;
}

type Order = "asc" | "desc";
type OrderBy = "filename" | "changetime" | "filesize"

interface EnhancedTableProps {
    onRequestSort: (order: Order, orderBy: OrderBy) => void;
    order: Order;
    orderBy: OrderBy;
}

function EnhancedTableHead({order, orderBy, onRequestSort}: EnhancedTableProps) {
    const changeOrder = (to: OrderBy) => {
        if (orderBy === to) {
            onRequestSort(order === "asc" ? "desc" : "asc", to);
        } else {
            onRequestSort("asc", to);
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
    if (isDir(a.name) && isDir(b.name)) {
        return a.name > b.name ? 1 : -1;
    }
    if (isDir(a.name)) {
        return -1;
    }
    if (isDir(b.name)) {
        return 1;
    }
    const res = a.name > b.name ? 1 : -1;
    return order === "asc" ? res : -res;
}

function filesizeComparator(a: NginxFile, b: NginxFile, order: Order) {
    const as = parseInt(a.size);
    const bs = parseInt(b.size);
    if (!isNumber(as) && !isNumber(bs)) {
        return a.name > b.name ? 1 : -1;
    }
    if (!isNumber(as)) {
        return -1;
    }
    if (!isNumber(bs)) {
        return 1;
    }
    const res = as === bs ? a.name > b.name ? 1 : -1 : as - bs;
    return order === "asc" ? res : -res;
}

function changetimeComparator(a: NginxFile, b: NginxFile, order: Order) {
    function base(a: NginxFile, b: NginxFile) {
        if (!a.date && !b.date) {
            return a.name > b.name ? 1 : -1;
        }
        if (!a.date) {
            return -1;
        }
        if (!b.date) {
            return 1;
        }
        if (a.date.getTime() === b.date.getTime()) {
            return a.name > b.name ? 1 : -1;
        }
        return b.date.getTime() - a.date.getTime();
    }

    return order === "asc" ? base(a, b) : base(b, a);
}

const makeComparator = (fn: (a: NginxFile, b: NginxFile, order: Order) => number) => (order: Order) => (a: NginxFile, b: NginxFile) => -fn(b, a, order);

const comparators: { [T in OrderBy]: (order: Order) => (a: NginxFile, b: NginxFile) => number } = {
    filename: makeComparator(filenameComparator),
    filesize: makeComparator(filesizeComparator),
    changetime: makeComparator(changetimeComparator),
};

interface FileTableProps {
    files: Array<NginxFile>;
}

const minWide = 620

function FileTable({files}: FileTableProps) {
    const [order, setOrder] = useState<Order>("asc");
    const [orderBy, setOrderBy] = useState<OrderBy>("filename");
    const [wideMode, setWideMode] = useState(false);
    const isWide = useMediaQuery(`(min-width: ${minWide + 50}px)`);

    const comparator = comparators[orderBy];

    return (
        <TableContainer>
            {!isWide && (
                <Toolbar>
                    <Typography sx={{flexGrow: 1}}></Typography>
                    <FormControlLabel
                        control={<Switch checked={wideMode} onChange={e => setWideMode(e.target.checked)}/>}
                        label="宽模式"
                    />
                </Toolbar>
            )}
            <Table sx={wideMode ? {minWidth: minWide} : {}}>
                <EnhancedTableHead
                    order={order}
                    orderBy={orderBy}
                    onRequestSort={(o, ob) => {
                        if (order !== o) setOrder(o);
                        if (orderBy !== ob) setOrderBy(ob);
                    }}
                />
                <TableBody>
                    {location.pathname !== "/" && (
                        <TableRow hover key="/index" sx={{cursor: "pointer"}} onClick={() => {
                            location.href = "../";
                        }}>
                            <TableCell align="right" padding="checkbox"/>
                            <TableCell align="left">
                                {/* @ts-ignore */}
                                <Typography href="../" sx={{color: "unset", textDecoration: "none"}}
                                            variant="body1" component="a">返回上一级</Typography>
                            </TableCell>
                            <TableCell
                                align="right"/>
                            <TableCell/>
                        </TableRow>
                    )}
                    {stableSort(files, comparator(order)).map(file => {
                        const filesize = parseInt(file.size);
                        return (
                            <TableRow hover key={file.name} sx={{cursor: "pointer"}} onClick={() => {
                                if (typeof file.href === "string") {
                                    location.href = file.href;
                                }
                            }}>
                                <TableCell align="right" padding="checkbox">
                                    {getFileIcon(file.name)}
                                </TableCell>
                                <TableCell align="left">
                                    {/* @ts-ignore */}
                                    <Typography href={file.href} sx={{color: "unset", textDecoration: "none"}}
                                                variant="body1" component="a">{file.name}</Typography>
                                </TableCell>
                                <TableCell
                                    align="right">{isNumber(filesize) && humanFileSize(filesize) || "-"}</TableCell>
                                <TableCell
                                    align="right">{file.date?.toLocaleDateString().replace(/\b(\d)\b/g, "0$1")}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default FileTable;
