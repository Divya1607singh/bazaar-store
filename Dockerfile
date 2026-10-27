# ---- Stage 1: check + build ----
FROM node:20-alpine AS build
WORKDIR /app
ARG GIT_SHA=dev
ENV GITHUB_SHA=$GIT_SHA
COPY package.json ./
COPY scripts ./scripts
COPY *.html *.css *.js ./
RUN npm run check && npm run build

# ---- Stage 2: serve with nginx ----
FROM nginx:1.27-alpine
RUN rm -f /etc/nginx/conf.d/default.conf
COPY docker/nginx.conf /etc/nginx/conf.d/app.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/healthz || exit 1
