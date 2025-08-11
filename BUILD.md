- [构建指南](#build-guide)
    - [环境要求](#build-environment-requirements)
    - [步骤](#build-steps)
- [开发指南](#development-guide)
    - [环境要求](#development-environment-requirements)
    - [步骤](#development-steps)
        - [准备调试用 Nginx](#development-prepare-nginx)
        - [启动开发服务器](#development-start-dev-server)

## 构建指南 {#build-guide}

### 环境要求 {#build-environment-requirements}

* Node.js 20 或更高

### 步骤 {#build-steps}

克隆仓库到本地

```bash
git clone https://github.com/skyone-wzw/nginx-autoindex.git
cd nginx-autoindex
```

安装依赖

```bash
npm install
```

构建

```bash
npm run build
```

构建产物位于 `build` 目录下

## 开发指南 {#development-guide}

### 环境要求 {#development-environment-requirements}

* Node.js 16 或更高，推荐使用最新的 LTS 版本
* 包管理使用 npm

### 步骤 {#development-steps}

克隆仓库到本地

```bash
git clone https://github.com/skyone-wzw/nginx-autoindex.git
cd nginx-autoindex
```

#### 准备调试用 Nginx {#development-prepare-nginx}

准备一个 nginx 容器，配置如下：

```nginx
server {
    listen      80;
    # No need to uncomment usually.
    # listen      [::]:80;
    charset utf-8;

    location / {
        root           /var/www/html;
        autoindex      on;
        add_after_body /autoindex.html;
    }
}
```

将一些测试文件挂载到 `/var/www/html` 目录下，并在该目录下创建一个 `autoindex.html` 文件，内容如下：

```html

<script>
    window.siteConfig = {
        name: "文件分享",
        footer: "Powered by Nginx AutoIndex & Skyone Beautify",
        readme: true,
        before: true
    }
    // @@DOCKER_CONFIG_START@@
    // @@DOCKER_CONFIG_END@@
    window.assets = {
        css: [],
        js: ["/nginx-autoindex/app.js"]
    }
</script>
<script defer="defer" src="/nginx-autoindex/bootloader.js"></script>
```

运行容器。

#### 启动开发服务器 {#development-start-dev-server}

编辑 `scripts/dev.js` 文件，将 `proxy` 字段修改为调试用 Nginx 的地址。

```javascript
module.exports = merge(common, {
    // ...
    devServer: {
        host: SERVER_HOST,
        port: SERVER_PORT,
        compress: true,
        open: true,
        hot: true,
        historyApiFallback: {
            disableDotRule: true,
            index: "/",
        },
        // 修改这里
        proxy: [{
            context: ["**", "!/nginx-autoindex/**"],
            target: "http://<调试用 Nginx 的 IP>",
        }],
    },
});
```

```bash
npm run start
```

脚本会自动打开浏览器，访问 `http://localhost:3000` 即可看到效果。

使用你喜欢的编辑器进行开发，保存文件后浏览器会自动热更新。
