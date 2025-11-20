FROM node:24 AS builder

WORKDIR /app
COPY ./package* .
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:latest

LABEL maintainer="Nginx Autoindex Maintainers <https://github.com/skyone-wzw/nginx-autoindex>" org.opencontainers.image.licenses="MIT"
COPY docker/default.conf /etc/nginx/conf.d/default.conf
COPY docker/01-generate-autoindex.sh /docker-entrypoint.d
COPY --from=builder /app/build /var/www/autoindex

VOLUME ["/var/www/html"]
EXPOSE 80/tcp
