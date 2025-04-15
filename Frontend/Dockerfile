# Use Nginx as base image
FROM nginx:stable-alpine

RUN rm -rf /usr/share/nginx/html/*

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static files to Nginx's default serving directory
COPY pages/ /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY javascript/ /usr/share/nginx/html/javascript/
COPY images/ /usr/share/nginx/html/images/

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]