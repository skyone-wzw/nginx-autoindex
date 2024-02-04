import {Paragraph, Root, Text} from "mdast";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import {unified} from "unified";
import {visit} from "unist-util-visit";
import {VFile} from "vfile";

export function BlockQuotePlugin() {
    const paths = {
        note: "M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z",
        tip: "M8 1.5c-2.363 0-4 1.69-4 3.75 0 .984.424 1.625.984 2.304l.214.253c.223.264.47.556.673.848.284.411.537.896.621 1.49a.75.75 0 0 1-1.484.211c-.04-.282-.163-.547-.37-.847a8.456 8.456 0 0 0-.542-.68c-.084-.1-.173-.205-.268-.32C3.201 7.75 2.5 6.766 2.5 5.25 2.5 2.31 4.863 0 8 0s5.5 2.31 5.5 5.25c0 1.516-.701 2.5-1.328 3.259-.095.115-.184.22-.268.319-.207.245-.383.453-.541.681-.208.3-.33.565-.37.847a.751.751 0 0 1-1.485-.212c.084-.593.337-1.078.621-1.489.203-.292.45-.584.673-.848.075-.088.147-.173.213-.253.561-.679.985-1.32.985-2.304 0-2.06-1.637-3.75-4-3.75ZM5.75 12h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5ZM6 15.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z",
        important: "M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v9.5A1.75 1.75 0 0 1 14.25 13H8.06l-2.573 2.573A1.458 1.458 0 0 1 3 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25Zm1.75-.25a.25.25 0 0 0-.25.25v9.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h6.5a.25.25 0 0 0 .25-.25v-9.5a.25.25 0 0 0-.25-.25Zm7 2.25v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z",
        warning: "M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z",
        caution: "M4.47.22A.749.749 0 0 1 5 0h6c.199 0 .389.079.53.22l4.25 4.25c.141.14.22.331.22.53v6a.749.749 0 0 1-.22.53l-4.25 4.25A.749.749 0 0 1 11 16H5a.749.749 0 0 1-.53-.22L.22 11.53A.749.749 0 0 1 0 11V5c0-.199.079-.389.22-.53Zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z",
    };

    function makeSvg(type: keyof typeof paths) {
        return {
            type: "element",
            data: {
                hName: "svg",
                hProperties: {
                    viewBox: "0 0 16 16",
                    version: "1.1",
                    width: "16",
                    height: "16",
                },
            },
            children: [{
                type: "element",
                data: {
                    hName: "path",
                    hProperties: {
                        d: paths[type],
                    },
                },
                children: [],
            }],
        };
    }

    return function (tree: Root, _: VFile) {
        visit(tree, "blockquote", (node) => {
            if (node.children[0]?.type === "paragraph" && node.children[0].children[0]?.type === "text") {
                const paragraph = node.children[0] as Paragraph;
                const text = paragraph.children[0] as Text;
                node.data = node.data || {};
                node.data.hProperties = node.data.hProperties || {};
                node.data.hProperties.className = node.data.hProperties.className || [];
                if (text.value.match(/^\[!NOTE]/i)) {
                    (node.data.hProperties.className as Array<string>).push("quote-note", "quote-alert");
                    text.value = text.value.replace(/^\[!NOTE]\s*/i, "");
                    const noteNode = {
                        type: "element",
                        data: {
                            hName: "p",
                            hProperties: {
                                className: ["quote-alert-title", "text-sm", "font-bold"],
                            },
                        },
                        children: [
                            makeSvg("note"),
                            {
                                type: "text",
                                value: "NOTE",
                            },
                        ],
                    } as any;
                    node.children.unshift(noteNode);
                }
                if (text.value.match(/^\[!TIP]/i)) {
                    (node.data.hProperties.className as Array<string>).push("quote-tip", "quote-alert");
                    text.value = text.value.replace(/^\[!TIP]\s*/i, "");
                    const tipNode = {
                        type: "element",
                        data: {
                            hName: "p",
                            hProperties: {
                                className: ["quote-alert-title", "text-sm", "font-bold"],
                            },
                        },
                        children: [
                            makeSvg("tip"),
                            {
                                type: "text",
                                value: "TIP",
                            },
                        ],
                    } as any;
                    node.children.unshift(tipNode);
                }
                if (text.value.match(/^\[!IMPORTANT]/i)) {
                    (node.data.hProperties.className as Array<string>).push("quote-important", "quote-alert");
                    text.value = text.value.replace(/^\[!IMPORTANT]\s*/i, "");
                    const infoNode = {
                        type: "element",
                        data: {
                            hName: "p",
                            hProperties: {
                                className: ["quote-alert-title", "text-sm", "font-bold"],
                            },
                        },
                        children: [
                            makeSvg("important"),
                            {
                                type: "text",
                                value: "IMPORTANT",
                            },
                        ],
                    } as any;
                    node.children.unshift(infoNode);
                }
                if (text.value.match(/^\[!WARNING]/i)) {
                    (node.data.hProperties.className as Array<string>).push("quote-warning", "quote-alert");
                    text.value = text.value.replace(/^\[!WARNING]\s*/i, "");
                    const warningNode = {
                        type: "element",
                        data: {
                            hName: "p",
                            hProperties: {
                                className: ["quote-alert-title", "text-sm", "font-bold"],
                            },
                        },
                        children: [
                            makeSvg("warning"),
                            {
                                type: "text",
                                value: "WARNING",
                            },
                        ],
                    } as any;
                    node.children.unshift(warningNode);
                }
                if (text.value.match(/^\[!CAUTION]/i)) {
                    (node.data.hProperties.className as Array<string>).push("quote-danger", "quote-alert");
                    text.value = text.value.replace(/^\[!CAUTION]\s*/i, "");
                    const dangerNode = {
                        type: "element",
                        data: {
                            hName: "p",
                            hProperties: {
                                className: ["quote-alert-title", "text-sm", "font-bold"],
                            },
                        },
                        children: [
                            makeSvg("caution"),
                            {
                                type: "text",
                                value: "CAUTION",
                            },
                        ],
                    } as any;
                    node.children.unshift(dangerNode);
                }
            }
        });
    };
}

async function render(markdown: string) {
    const content = String(
        await unified()
            .use(remarkParse)
            .use(remarkGfm)
            .use(remarkMath)
            .use(BlockQuotePlugin)
            .use(remarkRehype, {allowDangerousHtml: true})
            .use(rehypeKatex)
            .use(rehypeHighlight)
            .use(rehypeRaw)
            .use(rehypeStringify)
            .process(markdown),
    );
    if (!content) throw new Error();
    return content;
}

export default render;
