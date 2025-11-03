# Nginx 設定檔說明

## 概述
這個 nginx 設定檔專為您的 Next.js 應用在 EC2 上運行而設計，支援 SSL/HTTPS 和 Let's Encrypt 證書。

## 主要功能

### 1. SSL/HTTPS 支援
- 自動重定向 HTTP 到 HTTPS
- 支援 Let's Encrypt 證書
- 現代 SSL 安全設定

### 2. 效能優化
- 靜態檔案快取（1年）
- HTTP/2 支援
- 連接保持（keepalive）
- 適當的緩衝設定

### 3. 安全設定
- 安全標頭（HSTS, XSS Protection 等）
- 基本認證（可選）
- 錯誤頁面處理

### 4. 監控與日誌
- 詳細的存取和錯誤日誌
- 健康檢查端點
- 日誌輪轉

## 檔案結構

```
/etc/nginx/nginx.conf          # 主要設定檔
/etc/letsencrypt/live/         # SSL 證書目錄
/var/log/nginx/               # 日誌目錄
/var/www/next-app/           # Next.js 應用目錄
```

## 部署步驟

### 1. 部署 nginx 設定檔
```bash
chmod +x deploy-nginx.sh
./deploy-nginx.sh
```

### 2. 手動部署（如果需要）
```bash
# 上傳設定檔
scp -i ~/Downloads/mamezou_ssh.pem nginx.conf ec2-user@3.236.177.143:~/

# 登入 EC2
ssh -i ~/Downloads/mamezou_ssh.pem ec2-user@3.236.177.143

# 備份現有設定
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup

# 更新設定檔
sudo cp ~/nginx.conf /etc/nginx/nginx.conf

# 測試設定
sudo nginx -t

# 重啟 nginx
sudo systemctl restart nginx
```

## 設定說明

### 上游伺服器
```nginx
upstream nextjs_backend {
    server 127.0.0.1:3000;
    keepalive 32;
}
```
- 指向 Next.js 應用（端口 3000）
- 保持 32 個連接

### HTTP 重定向
```nginx
server {
    listen 80;
    server_name demo3.edu-cart.jp www.demo3.edu-cart.jp;
    
    # Let's Encrypt 驗證
    location /.well-known/acme-challenge/ {
        root /var/www/next-app/public;
        try_files $uri =404;
    }
    
    # 重定向到 HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}
```

### HTTPS 主要設定
- SSL 證書路徑：`/etc/letsencrypt/live/demo3.edu-cart.jp/`
- 支援 HTTP/2
- 現代 SSL 加密套件
- 安全標頭設定

### 靜態檔案快取
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    proxy_pass http://nextjs_backend;
}
```

### API 路由處理
```nginx
location /api/ {
    # 不快取 API 回應
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires "0";
}
```

## 故障排除

### 1. 檢查 nginx 狀態
```bash
sudo systemctl status nginx
sudo nginx -t
```

### 2. 查看日誌
```bash
# 錯誤日誌
sudo tail -f /var/log/nginx/demo3.edu-cart.jp.error.log

# 存取日誌
sudo tail -f /var/log/nginx/demo3.edu-cart.jp.access.log
```

### 3. 檢查端口
```bash
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

### 4. SSL 證書問題
```bash
# 檢查證書狀態
sudo certbot certificates

# 手動更新證書
sudo certbot renew --dry-run
```

### 5. 恢復備份
```bash
sudo cp /etc/nginx/nginx.conf.backup /etc/nginx/nginx.conf
sudo nginx -t
sudo systemctl restart nginx
```

## 安全建議

1. **定期更新 SSL 證書**
   - Let's Encrypt 證書每 90 天自動更新
   - 檢查更新狀態：`sudo certbot certificates`

2. **監控日誌**
   - 定期檢查錯誤日誌
   - 設定日誌輪轉

3. **防火牆設定**
   - 確保只開放必要端口（80, 443）
   - 使用 AWS Security Groups

4. **備份設定**
   - 定期備份 nginx 設定檔
   - 備份 SSL 證書

## 效能調優

1. **調整 worker 進程數**
   ```nginx
   worker_processes auto;
   worker_connections 1024;
   ```

2. **啟用 gzip 壓縮**
   ```nginx
   gzip on;
   gzip_types text/plain text/css application/json application/javascript;
   ```

3. **調整緩衝設定**
   ```nginx
   proxy_buffer_size 4k;
   proxy_buffers 8 4k;
   ```

## 注意事項

1. 確保 Next.js 應用在端口 3000 運行
2. 確保域名 DNS 指向正確的 EC2 IP
3. 首次部署時需要手動申請 SSL 證書
4. 定期檢查和更新 nginx 版本 