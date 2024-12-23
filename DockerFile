# 构建阶段
FROM node:20-alpine3.19 AS builder

# 设置 npm 镜像源
RUN npm config set registry https://registry.npmmirror.com/

# 安装 pnpm 并设置 pnpm 镜像源
RUN npm install -g pnpm@latest && pnpm config set registry https://registry.npmmirror.com/
# 将前端源码复制到 /app 目录中
WORKDIR /blog-admin
# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 使用 pnpm 安装依赖
RUN pnpm install --frozen-lockfile

COPY . .

# 编译项目
RUN pnpm run build

FROM nginx:1.19.6

# 复制 nginx.conf 配置文件到镜像中
COPY ["./_nginx/default.conf", "/etc/nginx/nginx.conf"]

# 删除 nginx html 原有内容
RUN rm -rf /usr/share/nginx/html/*

EXPOSE 80

# 从编译镜像复制编译结果到此镜像
COPY --from=builder /blog-admin/dist /usr/share/nginx/html
