window.siteConfig ??= {} as any;
window.siteConfig.name ??= "文件分享";
window.siteConfig.title ??= window.siteConfig.name;

if (process.env.NODE_ENV === "development") {
    // Development mode
    document.body.innerHTML = "<div id='root'></div>";
    for (const style of window.assets!.css) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = style;
        document.head.appendChild(link);
    }
    for (const js of window.assets!.js) {
        const script = document.createElement("script");
        script.src = js;
        document.body.appendChild(script);
    }
    if (module && module.hot) {
        module.hot.accept();
    }
} else {
    bootstrap();
}

function bootstrap() {
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>${window.siteConfig.title}</title>
    ${window.assets!.css.map(css => `<link rel="stylesheet" href="${css}"/>`).join("\n    ")}
</head>
<body>
<noscript>You need to enable JavaScript to run this app.</noscript>
<div id="root"></div>
<script>
    window.siteConfig = ${JSON.stringify(window.siteConfig)}; 
</script>
${window.assets!.js.map(js => `<script src="${js}"></script>`).join("\n")}
</body>
</html>`;
    document.open();
    document.write(html);
    document.close();
}