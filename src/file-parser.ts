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
            const _data = element.data.match(/^\s*(.*?)\s+(?:\d+\S*|-)\s*$/)?.[1];
            date = new Date(_data ?? "");
            date = isNaN(date?.getTime()) ? null : date;

            const _size = parseInt(element.data.match(/\s+(\d+|-)\s*$/)?.[1] ?? "-");
            if (isNaN(_size)) {
                const _size = element.data.match(/\s+(\d+\S*|-)\s*$/)?.[1] ?? "-";
                const bytes = convertToBytes(_size);
                size = isNaN(bytes) ? null : bytes;
            } else {
                size = _size;
            }
        }
        files.push({ name, href, date, size });
        element = element?.nextSibling;
    }

    console.log({ path, files } as NginxPageMetadata)

    return { path, files } as NginxPageMetadata;
}

// by GPT-4o and modified
function convertToBytes(sizeStr: string): number {
    const units: { [key: string]: number } = {
        'K': 1024,
        'M': 1024 ** 2,
        'G': 1024 ** 3,
        'T': 1024 ** 4,
        'P': 1024 ** 5,
        'E': 1024 ** 6,
        'Z': 1024 ** 7,
        'Y': 1024 ** 8,
    };
    const num = parseInt(sizeStr.slice(0, -1));
    const unit = sizeStr.slice(-1).toUpperCase();
    if (units[unit]) {
        return num * units[unit];
    } else {
        return NaN;
    }
}

export default fileParser;
