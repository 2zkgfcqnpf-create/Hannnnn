# TokenVolt

TokenVolt 是一个使用原生 HTML、CSS、JavaScript 与 Python 标准库构建的企业官网。联系表单会在服务器确认写入 SQLite 数据库后显示提交成功。

## 本地预览

仅预览页面可在项目目录运行：

```bash
python3 -m http.server 4173
```

然后访问：

```text
http://127.0.0.1:4173/
```

## 发布到 GitHub Pages

> GitHub Pages 只能展示静态网页，不能运行本项目的 Python/SQLite 服务。因此联系表单在 GitHub Pages 上不会保存客户信息。需要保存信息时，请按下方“独立服务器运行”部署到阿里云 ECS 等服务器。

1. 新建 GitHub 仓库并上传本目录中的全部文件。
2. 打开仓库的 `Settings` → `Pages`。
3. 在 `Build and deployment` 中选择 `Deploy from a branch`。
4. 选择 `main` 分支和根目录 `/ (root)`，保存后等待发布完成。

页面中的资源均使用相对路径，可直接运行在 GitHub Pages 的项目子路径下。

## 独立服务器运行

仓库附带一个轻量服务，既提供网页，也负责保存预约信息：

```bash
python3 deploy/tokenvolt_server.py \
  --root . \
  --host 0.0.0.0 \
  --port 4192 \
  --database ./private-data/leads.sqlite3
```

数据库必须放在网站公开目录之外；线上推荐使用 `/var/lib/tokenvolt/leads.sqlite3`。数据库目录权限为仅服务账号可访问，网页不提供查询或下载接口。

管理员需要查看数据时，可在服务器上导出 CSV：

```bash
python3 deploy/export_leads.py /var/lib/tokenvolt/leads.sqlite3 --output tokenvolt-leads.csv
```

健康检查地址为 `/api/health`，成功时返回 `{"ok": true, "storage": "ready"}`。
