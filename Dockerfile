FROM jwater7/alpine-supervisor-python-nodejs
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
#ENV START_SCHEDULE
#ENV DURATION_SEC
#ENV POST_PROCESS_PROJECT_PATH /post

VOLUME /post

CMD sh -c "envsubst < /usr/src/app/supervisor_conf/scheduler.ini > /etc/supervisor.d/scheduler.ini && envsubst < /usr/src/app/supervisor_conf/job.ini > /etc/supervisor.d/job.ini && exec supervisord -c /etc/supervisord.conf"

