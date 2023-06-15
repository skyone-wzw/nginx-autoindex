import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import {unified} from "unified/lib";

async function render(markdown: string) {
    const content = String(
        await unified()
            .use(remarkParse)
            .use(remarkGfm)
            .use(remarkMath)
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
