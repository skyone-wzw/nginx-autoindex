FROM node:20 AS builder

WORKDIR /app
COPY ./package* .
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:latest

COPY docker/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /var/www/autoindex

VOLUME ["/var/www/html"]
EXPOSE 80/tcp
