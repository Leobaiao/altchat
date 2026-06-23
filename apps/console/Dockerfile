FROM node:20-alpine AS builder

WORKDIR /app

# Install turbo
RUN npm install -g turbo@2.0.4

# Copy everything
COPY . .

# Install dependencies
RUN npm install

# Inject environment variables during build if necessary (Vite embeds them)
ENV VITE_API_BASE=http://localhost:4300

# Build console
RUN turbo run build --filter=@altchat/console

# Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/apps/console/dist /usr/share/nginx/html

# Copy a basic nginx conf to support SPA routing (redirect all to index.html)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
