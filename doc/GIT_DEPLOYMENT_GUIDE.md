# Git 部署指南

## 概述
本文件說明如何使用 Git 指令將本地專案部署到 GitHub 倉庫 `V-Growth-EC/v-growth_demo`。

## Git 部署流程

### 1. 初始化本地 Git 倉庫（如果尚未初始化）

```bash
# 檢查是否已經初始化 Git
git status

# 如果顯示 "not a git repository"，則需要初始化
git init
```

### 2. 添加遠端倉庫

```bash
# 添加 GitHub 遠端倉庫
git remote add origin https://github.com/V-Growth-EC/v-growth_demo.git

# 或者使用 SSH（如果您有 SSH 金鑰設定）
git remote add origin git@github.com:V-Growth-EC/v-growth_demo.git

# 檢查遠端倉庫設定
git remote -v
```

### 3. 拉取最新程式碼

```bash
# 拉取遠端倉庫的最新程式碼
git pull origin main

# 如果本地分支與遠端分支不同，可能需要設定上游分支
git branch --set-upstream-to=origin/main main
```

### 4. 準備部署

#### 4.1 檢查變更狀態
```bash
# 查看當前變更狀態
git status

# 查看變更內容
git diff
```

#### 4.2 添加變更到暫存區
```bash
# 添加所有變更
git add .

# 或者添加特定檔案
git add src/app/page.js
git add src/app/api/product-overview/route.js
git add DEPLOYMENT_GUIDE.md
```

#### 4.3 提交變更
```bash
# 提交變更（請使用有意義的提交訊息）
git commit -m "feat: 新增分頁功能和部署指南

- 新增產品分頁功能
- 新增完整的部署指南文件
- 優化 API 回應格式
- 新增 Git 部署指南"
```

### 5. 推送到 GitHub

#### 5.1 推送到主分支
```bash
# 推送到 main 分支
git push origin main
```

#### 5.2 如果需要強制推送（謹慎使用）
```bash
# 強制推送（僅在必要時使用）
git push origin main --force
```

### 6. 檢查部署狀態

#### 6.1 檢查 GitHub Actions（如果設定）
```bash
# 在 GitHub 網頁上檢查 Actions 標籤
# 或者使用 GitHub CLI
gh run list
```

#### 6.2 檢查程式碼是否正確推送
```bash
# 查看遠端倉庫狀態
git fetch origin
git status
```

## 常用 Git 指令

### 基本操作
```bash
# 查看狀態
git status

# 查看分支
git branch -a

# 切換分支
git checkout main

# 創建並切換到新分支
git checkout -b feature/pagination
```

### 提交相關
```bash
# 查看提交歷史
git log --oneline

# 查看最近 N 筆提交
git log --oneline -5

# 查看特定檔案的提交歷史
git log --oneline src/app/page.js
```

### 合併與重置
```bash
# 合併分支
git merge feature/pagination

# 重置到特定提交
git reset --hard HEAD~1

# 重置到遠端分支狀態
git reset --hard origin/main
```

## 部署檢查清單

- [ ] 確認本地變更已保存
- [ ] 檢查 Git 狀態 (`git status`)
- [ ] 添加變更到暫存區 (`git add .`)
- [ ] 提交變更 (`git commit -m "訊息"`)
- [ ] 推送到 GitHub (`git push origin main`)
- [ ] 檢查 GitHub 倉庫是否更新
- [ ] 確認 GitHub Actions 運行狀態（如適用）

## 故障排除

### 常見問題

#### 1. 推送被拒絕
```bash
# 拉取最新變更
git pull origin main

# 如果有衝突，解決衝突後再次提交
git add .
git commit -m "解決衝突"
git push origin main
```

#### 2. 認證問題
```bash
# 設定 Git 認證
git config --global user.name "您的用戶名"
git config --global user.email "您的郵箱"

# 使用 Personal Access Token
git remote set-url origin https://YOUR_TOKEN@github.com/V-Growth-EC/v-growth_demo.git
```

#### 3. 分支問題
```bash
# 查看所有分支
git branch -a

# 切換到主分支
git checkout main

# 刪除本地分支
git branch -d feature/branch-name
```

## 自動化部署腳本

### 創建部署腳本
```bash
#!/bin/bash
# deploy-to-github.sh

echo "開始部署到 GitHub..."

# 檢查 Git 狀態
if [ -n "$(git status --porcelain)" ]; then
    echo "發現未提交的變更，正在提交..."
    git add .
    git commit -m "自動部署: $(date)"
fi

# 推送到 GitHub
echo "推送到 GitHub..."
git push origin main

echo "部署完成！"
```

### 使用腳本
```bash
# 給予執行權限
chmod +x deploy-to-github.sh

# 執行部署
./deploy-to-github.sh
```

## 注意事項

1. **提交訊息**：使用清晰、有意義的提交訊息
2. **分支管理**：主分支保持穩定，新功能使用功能分支
3. **權限管理**：確保有適當的 GitHub 倉庫權限
4. **備份**：重要變更前先備份
5. **測試**：推送前確保程式碼測試通過

## 聯繫資訊

如有 Git 部署相關問題，請聯繫開發團隊。
