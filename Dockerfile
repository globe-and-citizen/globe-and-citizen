# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV VITE_API_BASE_URL=https://rp.layer8proxy.net/v1
ENV VITE_FORWARD_PROXY_URL=https://fp.layer8proxy.net
ENV VITE_LAYER8_ENABLED=true
ENV VITE_LAYER8_BASE_URL_PROD=https://layer8proxy.net

RUN npm run build

# Runtime stage
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
