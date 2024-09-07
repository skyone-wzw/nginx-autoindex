export interface NginxFile {
    name: string;
    href: string;
    date: Date | null;
    size: number | null;
}

export interface NginxPageMetadata {
    path: string;
    files: NginxFile[];
}

type SizeUnit = "K" | "M" | "G" | "T" | "P" | "E" | "Z" | "Y";
type RoughSizeString = `${number}${SizeUnit}`;

function fileParser(dom: HTMLHtmlElement) {
    const files: NginxFile[] = [];
    const path = new URL(location.href).pathname.replace(/\/$/, "");

    let element: ChildNode | null | undefined = dom.querySelector("pre > a:nth-child(2)");
    while (element) {
        let name: NginxFile["name"] = "未知文件",
            href: NginxFile["href"] = "#",
            date: NginxFile["date"] = null,
            size: NginxFile["size"] = null;
        if (element instanceof HTMLAnchorElement) {
            name = decodeURIComponent(element.href).match(/\/([^\/]+\/?$)/)?.[1] ?? "未知文件";
            href = `${path}/${name}`;
        }
        element = element.nextSibling;
        if (element instanceof Text) {
            const _date = element.data.match(/^\s*(.*?)\s+(?:\d+[YZEPTGMK]?|-)\s*$/)?.[1];
            date = new Date(_date ?? "");
            date = isNaN(date?.getTime()) ? null : date;

            const _size = element.data.match(/\s+(\d+[YZEPTGMK]?|-)\s*$/)?.[1] ?? "-";
            if (_size.match(/^\d+$/)) {
                // 该项为文件, 大小精确
                size = parseInt(_size);
            } else if (_size.match(/^\d+[YZEPTGMK]$/)) {
                // 该项为文件, 大小模糊
                // Nginx 返回的模糊大小只包含 整数+单位
                size = convertToBytes(_size as RoughSizeString);
            } else if (_size === "-") {
                // 该项为文件夹
                size = null;
            }
        }
        files.push({name, href, date, size});
        element = element?.nextSibling;
    }

    console.log({path, files} as NginxPageMetadata);

    return {path, files} as NginxPageMetadata;
}

function convertToBytes(sizeStr: RoughSizeString): number {
    const units: { [key: string]: number } = {
        "K": 1024,
        "M": 1024 ** 2,
        "G": 1024 ** 3,
        "T": 1024 ** 4,
        "P": 1024 ** 5,
        "E": 1024 ** 6,
        "Z": 1024 ** 7,
        "Y": 1024 ** 8,
    };
    const num = parseInt(sizeStr.slice(0, -1));
    const unit = sizeStr.slice(-1).toUpperCase();
    // 由于前面正则的限制, 这里不会出现 NaN
    return num * units[unit];
}

export default fileParser;
