# AWS 部署指南

## 概述

本文件記錄了在 AWS 上部署 Next.js 應用並使用 Elastic Load Balancer (ELB) 的完整過程和問題解決方案。

## 架構說明

### ELB 架構
```
用戶 → HTTPS:443 → ELB → HTTP:80 → EC2
```

- **ELB 層級**: 處理 HTTPS 加密/解密，SSL 終止
- **EC2 層級**: 只處理 HTTP，運行 Next.js 應用

### 組件配置
- **域名**: `www3.edu-cart.jp`
- **負載平衡器**: `ec-lb` (3.217.164.60)
- **EC2 實例**: `ec-vm-f-1` (100.27.8.30)
- **目標群組**: `ec-targetg-f-new`

## 部署步驟

### 1. 建立目標群組

#### 基本設定
- **名稱**: `ec-targetg-f-new`
- **通訊協定**: HTTP
- **連接埠**: 80
- **VPC**: `vpc-0f6c8572`

#### 健康檢查設定
- **通訊協定**: HTTP
- **路徑**: `/`
- **連接埠**: 流量連接埠 (80)
- **成功碼**: 200
- **逾時**: 5 秒
- **間隔**: 30 秒

### 2. 配置 EC2 實例

#### nginx 配置
```nginx
server {
    listen 80;
    server_name www3.edu-cart.jp;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### 服務管理
```bash
# 啟動 nginx
sudo systemctl start nginx

# 設定開機自動啟動
sudo systemctl enable nginx

# 檢查狀態
sudo systemctl status nginx
```

### 3. 關聯到負載平衡器

#### 監聽器設定
- **通訊協定**: HTTPS
- **連接埠**: 443
- **預設動作**: 轉送至目標群組 `ec-targetg-f-new`

## 問題解決記錄

### 問題 1: SSL 憑證錯誤
**錯誤訊息**: `nginx: [emerg] cannot load certificate "/etc/letsencrypt/live/www3.edu-cart.jp/fullchain.pem"`

**解決方法**: 使用 ELB 的 SSL 終止，EC2 只處理 HTTP

### 問題 2: 健康檢查失敗
**錯誤訊息**: Health checks failed

**根本原因**: 目標群組使用 HTTPS:443，但 EC2 只監聽 HTTP:80

**解決方法**: 建立新的 HTTP:80 目標群組

### 問題 3: 目標群組配置不匹配
**問題**: 現有目標群組無法修改設定

**解決方法**: 建立新的目標群組，使用正確的配置

## 驗證方法

### 檢查 nginx 狀態
```bash
# 登入 EC2
ssh -i ~/Downloads/mamezou_ssh.pem ec2-user@100.27.8.30

# 檢查 nginx 狀態
sudo systemctl status nginx

# 檢查端口監聽
sudo netstat -tlnp | grep :80

# 測試本地連接
curl -I http://localhost
```

### 檢查目標群組狀態
- 前往 AWS Console → 目標群組
- 確認 EC2 實例狀態為 "Healthy"

### 測試網站訪問
- 瀏覽器訪問 `https://www3.edu-cart.jp`
- 確認網站正常運作

## 配置檔案

### nginx 配置
```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log notice;
pid /run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    upstream nextjs_backend {
        server 127.0.0.1:3000;
    }
    
    server {
        listen 80;
        server_name www3.edu-cart.jp;
        
        location / {
            proxy_pass http://nextjs_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## 重要注意事項

### SSL 憑證
- **不需要**在 EC2 上配置 SSL 憑證
- SSL 終止在 ELB 層級
- 用戶仍然通過 HTTPS 訪問網站

### 健康檢查
- 確保使用 HTTP 協議
- 確保路徑為 `/`
- 確保端口為 80

### 安全群組
- 確保 80 端口開放
- 確保 EC2 可以接收來自 ELB 的請求

## 故障排除

### 常見問題

#### 1. nginx 無法啟動
```bash
# 檢查配置語法
sudo nginx -t

# 查看錯誤日誌
sudo tail -f /var/log/nginx/error.log
```

#### 2. 健康檢查失敗
- 檢查目標群組設定
- 確認 nginx 正常運行
- 檢查安全群組設定

#### 3. 網站無法訪問
- 檢查 ELB 狀態
- 確認目標群組健康狀態
- 檢查 EC2 實例狀態

## 維護建議

### 定期檢查
- ELB 和 EC2 的健康狀態
- nginx 服務狀態
- 網站功能和性能

### 備份
- nginx 配置檔案
- 重要設定參數

### 監控
- 使用 AWS CloudWatch 監控
- 設定告警通知

## 相關資源

- [AWS ELB 文檔](https://docs.aws.amazon.com/elasticloadbalancing/)
- [nginx 配置指南](https://nginx.org/en/docs/)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)

---

*最後更新: 2025-08-23*
*狀態: 部署完成，運行正常*
