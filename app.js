// vim: tabstop=2 shiftwidth=2 expandtab
//

const path = require('path');
const fs = require('fs');
const request = require('request');
const schedule = require('node-schedule');
const child_process = require('child_process');
const debug = require('debug')('sound-stream-recorder:main');
//const pjson = require('./package.json');

const outfiledir = process.env.FILE_DIR || '/data';
const outfileprefix = process.env.FILE_PREFIX || '';
const outfileext = process.env.FILE_EXT || 'mp3';
const post_process_script = process.env.POST_PROCESS_SCRIPT || undefined;
const url = process.env.STREAM_URL;
const start_schedule = process.env.START_SCHEDULE;
const duration_sec = process.env.DURATION_SEC;
if (!url || !start_schedule || !duration_sec) {
  console.log('Missing required environment variables');
  return;
}

debug('Running schedule: ' + start_schedule);
// TODO run the job if we initialized after the schedule
// TODO this is GMT, need to support localtime
let job = schedule.scheduleJob(start_schedule, () => {

  let dt = new Date();
  let outfilename = path.join(outfiledir, outfileprefix + dt.toISOString() + '.' + outfileext);
  debug('Starting new schedule at ' + dt.toISOString() + ' for ' + outfilename );

  let output = fs.createWriteStream(outfilename);
  let stream = request(url);
  stream.pipe(output);

  setTimeout(() => {
    debug('Stopping job');
    stream.pause();
    stream.abort();
    if (post_process_script) {
      debug('Running post process script: ' + post_process_script);
      let forked = child_process.fork(post_process_script);
      forked.on('message', (msg) => {
        debug('post_proc: ' + msg);
      });
    }
  }, duration_sec * 1000, stream);

});

