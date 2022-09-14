FROM node:14 as build-stage
WORKDIR /app
COPY package*.json /app/
RUN yarn install
COPY ./ /app/
#RUN CI= npm test
RUN yarn run build

# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:1.15
COPY --from=build-stage /app/build/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
