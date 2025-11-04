# 專案部署指南

## 概述
本文件說明如何將 Next.js 專案部署到 AWS EC2 伺服器，並使用 PM2 進行程序管理。

## 部署流程

### 1. 專案打包與上傳

#### 1.1 執行部署腳本
```bash
# 在本地專案目錄執行
./deploy-ec2-www.sh
```

此腳本會：
- 打包專案
- 上傳至 AWS EC2 伺服器
- 確保專案為最新版本

#### 1.2 驗證上傳
檢查檔案是否正確上傳到伺服器。

### 2. 連接到 AWS 伺服器

#### 2.1 SSH 連接
```bash
ssh -i ~/Downloads/mamezou_ssh.pem ec2-user@100.27.8.30
```

### 3. PM2 程序管理

#### 3.1 檢查當前 PM2 狀態
```bash
pm2 status
```
確認是否有名為 `v-growth-demo` 的程序正在運行。

#### 3.2 停止並刪除舊程序（如需要）
```bash
# 刪除舊的 PM2 程序
pm2 delete v-growth-demo
```

#### 3.3 啟動新程序
```bash
# 進入專案目錄
cd /var/www/next-app

# 使用 PM2 啟動應用
pm2 start npm --name v-growth-demo -- start
```

#### 3.4 驗證程序啟動
```bash
# 檢查 PM2 狀態
pm2 status

# 檢查程式是否正常運行
pm2 logs v-growth-demo
```

### 4. 端口管理

#### 4.1 檢查 3000 端口
```bash
# 檢查是否有程序佔用 3000 端口
sudo netstat -tulnp | grep 3000
```

#### 4.2 強制終止佔用端口的程序（如需要）
```bash
# 找到佔用端口的程序 PID
sudo netstat -tulnp | grep 3000

# 終止程序（替換 {PID} 為實際的進程 ID）
kill -9 {PID}

# 範例：
kill -9 90391
```

### 5. PM2 常用指令

```bash
# 查看所有程序狀態
pm2 status

# 停止程序
pm2 stop v-growth-demo

# 查看程序日誌
pm2 logs v-growth-demo

# 保存當前 PM2 配置
pm2 save

# 設置開機自動啟動
pm2 startup
```

## 部署檢查清單

- [ ] 執行 `deploy-ec2-www.sh` 腳本
- [ ] SSH 連接至 AWS 伺服器
- [ ] 檢查舊的 PM2 程序並刪除（如需要）
- [ ] 檢查 3000 端口是否被佔用
- [ ] 啟動新的 PM2 程序
- [ ] 驗證程序正常運行
- [ ] 測試網站功能

## 故障排除

### 常見問題

#### 1. 端口被佔用
```bash
# 檢查端口
sudo netstat -tulnp | grep 3000

# 終止佔用程序
kill -9 {PID}
```

#### 2. PM2 程序無法啟動
```bash
# 查看錯誤日誌
pm2 logs v-growth-demo

# 檢查專案目錄
ls -la /var/www/next-app


