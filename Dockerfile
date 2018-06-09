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
#ENV POST_PROCESS_SCRIPT
#ENV START_SCHEDULE
#ENV DURATION_SEC

VOLUME /data

CMD [ "npm", "start" ]

