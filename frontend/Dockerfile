# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# The frontend directory currently contains a blank slate initialized for the next phase of development.
# So we create a dummy package.json if it doesn't exist to allow npm install/build to run in Dockerfile
# But for a real app it will copy the package.json and install
COPY package*.json ./
RUN if [ -f "package.json" ]; then npm install; else echo '{"name": "frontend"}' > package.json && npm install; fi

COPY . .

# Dummy build step for when vite is not actually initialized yet
RUN if [ -f "package.json" ] && grep -q '"build"' package.json; then npm run build; else mkdir -p dist && echo "<h1>Frontend not initialized yet</h1>" > dist/index.html; fi

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
