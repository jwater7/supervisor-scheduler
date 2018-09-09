# supervisor-scheduler

Start and stop supervisord jobs on a schedule
Optionally post-process the file after the duration

### Supported environment variables

Required:
* START_SCHEDULE
  * E.g. '00 55 10 * * 6' (every sat at 10:55am)
  * Use the cron syntax at: https://www.npmjs.com/package/cron

Optional:
* DURATION_SEC
  * Default: 0 (neither stop nor post process)
  * E.g. 10800 (3 hours)
* "POST_PROCESS_PROJECT_PATH=undefined"
  * Default: undefined
  * E.g. '/post' (see post-process project requirements)
* "DEBUG=supervisor-scheduler:*"

### Be sure timezone is set in the docker container for an accurate schedule:
~~~~
    volumes:
      - "/etc/localtime:/etc/localtime:ro"
    environment:
      - "TZ=America/Los_Angeles"
~~~~

### Post-process project requirements:
Must be a NodeJS project with a package.json so "npm install" and "npm start" can be run on it during runtime.

