## Nginx AutoIndex 美化

这是一个调试/示例的页面

<iframe title="APlayer" class="aplayer" src="https://tc.skyone.host/music/player.html?name=BlueArchive"></iframe>

基于 React + MUI + Remark

配置文件：

```html
<script>
    window.siteConfig = {
        name: "Skyone 文件分享",
        footer: "Powered by Nginx AutoIndex & Skyone Beautify",
        readme: true,
        before: true
    }
</script>
<script src="/nginx-autoindex/app.js"></script>
<link href="/nginx-autoindex/app.css" rel="stylesheet">
```

下面是 `Markdown` 语法测试

## 测试

### html 标签

```html
<center>123</center>
```

<center>123</center>

### 代码：

```javascript
async function markdownParser(markdown: string) {
    const content = String(
        await unified()
            .use(remarkParse)
            .use(remarkGfm)
            .use(remarkMath)
            .use(remarkRehype, {allowDangerousHtml: true})
            .use(rehypeRaw)
            .use(rehypeMathJaxSvg)
            .use(rehypeStringify)
            .process(markdown),
    );
    if (!content) throw new Error();
    return content;
}
```

```markdown
## Markdown in markdown

> QAQ
```

```c
int main() {
    printf("Hello world");
    
    return 0;
}
```

----

<center><img alt="Error" src="/nginx-autoindex/error.webp" style="max-width: 500px; width: 100%"/></center>



[Skyone Blog](https://www.skyone.host)

### 数学

行内公式: $\pi$

$$
e^{i\pi}+1=0
$$

$$
\sin(x) = x-\frac{x^3}{3!}+\frac{x^5}{5!}-\frac{x^7}{7!}+\dotsb
$$
