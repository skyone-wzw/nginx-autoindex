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
            const _data = element.data.match(/^\s*(.*?)\s+(?:\d+|-)\s*$/)?.[1];
            date = new Date(_data ?? "");
            date = isNaN(date?.getTime()) ? null : date;

            const _size = parseInt(element.data.match(/\s+(\d+|-)\s*$/)?.[1] ?? "-");
            size = isNaN(_size) ? null : _size;
        }
        files.push({name, href, date, size});
        element = element?.nextSibling;
    }

    console.log({path, files} as NginxPageMetadata)

    return {path, files} as NginxPageMetadata;
}

export default fileParser;
