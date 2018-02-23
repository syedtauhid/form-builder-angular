FROM node:8 as builder
WORKDIR /build

COPY . /build
RUN npm --quiet install && \
    npm --quiet install -g gulp-cli && \
    gulp build-dist

FROM nginx:1.13.5-alpine

COPY --from=builder /build/dist/ /usr/share/nginx/html/
