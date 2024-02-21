export interface NginxFile {
    name: string;
    href: string;
    date: Date | null;
    size: number | null;
}

function fileParser(base: string, dom: HTMLHtmlElement) {
    const files: NginxFile[] = [];
    const path = base.replace(/\/$/, "");

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

    return files;
}

export default fileParser;
