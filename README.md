# sound-stream-recorder

Stream audio to a file on a schedule
Optionally post-process the file after duration

Supported environment variables:

Required:
* STREAM_URL
  * E.g. 'http://localhost:8000/live'
* START_SCHEDULE
  * E.g. '00 55 10 * * 6' (every sat at 10:55am)
  * Use the cron syntax at: https://www.npmjs.com/package/cron

Optional:
* DURATION_SEC
  * Default: 0 (neither stop nor post process)
  * E.g. 10800 (3 hours)
* "FILE_DIR"
  * Default: /data
* "FILE_PREFIX"
  * Default: ''
  * E.g. 'sr_program_'
* "FILE_EXT"
  * Default: 'mp3'
* "POST_PROCESS_PROJECT_PATH=undefined"
  * Default: undefined
  * E.g. '/post' (see post-process project requirements)
* "DEBUG=sound-stream-recorder:*"

## Be sure timezone is mounted in the docker container for an accurate schedule:
~~~~
    volumes:
      - "/etc/localtime:/etc/localtime:ro"
~~~~

## Post-process project requirements:
Must be a NodeJS project with a package.json so "npm install" and "npm start" can be run on it during runtime.
The first argument (translates to #2, with node as #0 and app.js as #1) to the application is the filename of the recording

For example, an app.js may look like:
~~~~
const debug = require('debug')('sound-stream-recorder:post');
const datestart = new Date();
const file = process.argv[2];
debug('Finished at ' + datestart + ' given file: ' + file)
~~~~

