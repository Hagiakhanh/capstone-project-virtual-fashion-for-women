# ----------- Giai đoạn 1: Cài đặt dependencies -------------
FROM node:20-alpine AS deps
WORKDIR /app

# Cài đặt libc6-compat nếu cần trên Alpine
RUN apk add --no-cache libc6-compat

# Copy file định nghĩa package để tận dụng Docker cache
COPY package.json package-lock.json ./
RUN npm ci

# ----------- Giai đoạn 2: Build source code -------------
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Tắt gửi dữ liệu ẩn danh về Vercel trong lúc build
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js (sinh ra thư mục .next/standalone)
RUN npm run build

# ----------- Giai đoạn 3: Runtime Stage (Chạy thực tế) -------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Tạo user riêng 'nextjs' thay vì chạy bằng 'root' để tăng bảo mật
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy thư mục static và public
COPY --from=builder /app/public ./public

# Phân quyền cho thư mục cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Chỉ copy đúng sản phẩm standalone siêu nhẹ
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Chạy server Next.js standalone
CMD ["node", "server.js"]