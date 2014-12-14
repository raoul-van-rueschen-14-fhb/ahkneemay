# DOCKER-VERSION 1.0
FROM    ubuntu:latest
#
# Install nodejs npm
#
RUN apt-get update
RUN apt-get install -y nodejs npm
#
# add application sources
#
COPY . /server
RUN cd /server; npm install
#
# Expose the default port
#
EXPOSE  8080
#
# Start command
#
CMD ["nodejs", "/server/index.js"]
