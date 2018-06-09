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
const post_proc_proj_path = process.env.POST_PROCESS_PROJECT_PATH || undefined;
const url = process.env.STREAM_URL;
const start_schedule = process.env.START_SCHEDULE;
const duration_sec = process.env.DURATION_SEC;
if (!url || !start_schedule || !duration_sec) {
  console.log('Missing required environment variables');
  console.log('STREAM_URL: ' + url);
  console.log('START_SCHEDULE: ' + start_schedule);
  console.log('DURATION_SEC: ' + duration_sec);
  return;
}

if (post_proc_proj_path) {
  debug('Checking install for post process project in ' + post_proc_proj_path);
  let code = child_process.execSync('npm install', {'cwd': post_proc_proj_path});
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
    if (post_proc_proj_path) {
      debug('Running post process script (npm start -- ' + outfilename + ') in ' + post_proc_proj_path);
      let child = child_process.spawn('npm', ['start', '-- ', outfilename], {'cwd': post_proc_proj_path, 'stdio': [0,1,2]});
      child.on('exit', (code, sig) => {
        debug('post_proc exiting with: ' + code);
      });
    }
  }, duration_sec * 1000, stream);

});

