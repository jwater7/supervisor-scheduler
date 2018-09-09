// vim: tabstop=2 shiftwidth=2 expandtab
//

const path = require('path');
const fs = require('fs');
const request = require('request');
const cron = require('cron');
const cron_parser = require('cron-parser');
const child_process = require('child_process');
const debug = require('debug')('supervisor-scheduler:main');
//const pjson = require('./package.json');

const post_proc_proj_path = process.env.POST_PROCESS_PROJECT_PATH || undefined;
const start_schedule = process.env.START_SCHEDULE;
const duration_sec = Number(process.env.DURATION_SEC) || 0;
if (!start_schedule) {
  console.log('Missing required environment variables');
  console.log('START_SCHEDULE: ' + start_schedule);
  return;
}

if (post_proc_proj_path) {
  debug('Checking install for post process project in ' + post_proc_proj_path);
  let code = child_process.execSync('npm install', {'cwd': post_proc_proj_path});
}
const run_post_job = () => {
  debug('Running post process script (npm start) in ' + post_proc_proj_path);
  let child = child_process.spawn('npm', ['start'], {'cwd': post_proc_proj_path, 'stdio': [0,1,2]});
  //let child = child_process.spawn('npm', ['start', '-- ', outfilename], {'cwd': post_proc_proj_path, 'stdio': [0,1,2]});
  child.on('exit', (code, sig) => {
    debug('post_proc exiting with: ' + code);
  });
}

const start_job = () => {
  let dt = new Date();
  debug('Starting new scheduled job at ' + dt.toISOString());
  let starter = child_process.spawn('supervisorctl', ['start', 'job'], {'stdio': [0,1,2]});
  starter.on('exit', (code, sig) => {
    debug('started with code: ' + code);
  });
}

const stop_job = () => {
  let dt = new Date();
  debug('Stopping job at ' + dt.toISOString());
  let stopper = child_process.spawn('supervisorctl', ['stop', 'job'], {'stdio': [0,1,2]});
  stopper.on('exit', (code, sig) => {
    debug('stopped with code: ' + code);
  });
}

let start_now = false;
try {
  let interval = cron_parser.parseExpression(start_schedule);
  let dnow = new Date();
  let prev = new Date(interval.prev());
  let last_end = new Date(prev.getTime() + (duration_sec * 1000));
  start_now = (last_end > dnow);
  if (start_now) {
    debug('Schedule should be currently running (' + last_end + ' > ' + dnow + '), forcing start now');
    start_job();
  }
} catch (e) {
  debug('Error with expression "' + start_schedule + '": ' + e.message);
}

debug('Setting up the scheduler with schedule: ' + start_schedule);
// TODO run the job if we initialized after the schedule
// TODO this is GMT, need to support localtime
let job = new cron.CronJob(start_schedule, () => {

  start_job();

  // no duration so no stop time once it starts at the scheduled time
  if (!duration_sec) {
    return;
  }

  setTimeout(() => {
    stop_job();
    if (post_proc_proj_path) {
      run_post_job();
    }
  }, duration_sec * 1000);

});

debug('Starting the scheduler...');
job.start();
debug('Scheduler is ready.');

