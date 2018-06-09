FROM node:alpine
LABEL maintainer "j"

# Backend node_modules
WORKDIR /usr/src/app

# Install dependencies
COPY package.json package-lock.json ./

RUN npm install

# Bundle app source
COPY . ./

# Default to production mode
ENV NODE_ENV production
#ENV STREAM_URL
#ENV FILE_DIR
#ENV FILE_PREFIX
#ENV FILE_EXT
#ENV START_SCHEDULE
#ENV DURATION_SEC
#ENV POST_PROCESS_PROJECT_PATH /post

VOLUME /data
VOLUME /post

CMD [ "npm", "start" ]

