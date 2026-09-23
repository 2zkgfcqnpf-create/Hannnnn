# TokenVolt

TokenVolt 是一个纯静态企业官网示例，使用原生 HTML、CSS 和 JavaScript 构建，无需安装依赖或执行构建命令。

## 本地预览

在项目目录运行：

```bash
python3 -m http.server 4173
```

然后访问：

```text
http://127.0.0.1:4173/
```

## 发布到 GitHub Pages

1. 新建 GitHub 仓库并上传本目录中的全部文件。
2. 打开仓库的 `Settings` → `Pages`。
3. 在 `Build and deployment` 中选择 `Deploy from a branch`。
4. 选择 `main` 分支和根目录 `/ (root)`，保存后等待发布完成。

页面中的资源均使用相对路径，可直接运行在 GitHub Pages 的项目子路径下。

## 独立服务器运行

仓库附带一个轻量静态服务器：

```bash
python3 deploy/tokenvolt_server.py --root . --host 0.0.0.0 --port 4192
```

