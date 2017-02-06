var app = require('cantina')
  , CronTime = require('cron').CronTime
  , timebucket = require('timebucket');

require('cantina-redis');
require('cantina-queue');

// Default configuration.
app.conf.add({
  cron: {
    active: false,
    jobs: [],
    interval: 1000 * 60 // 1 minute
  }
});

var conf = app.conf.get('cron');

// Expose the cron API.
app.cron = {
  jobs: [],
  _interval: null,

  /**
   * Schedules a new cron job
   *
   * @param {String|Date} cronTime - a valid cron time string or
   *                                 a Date object (to schedule a one-time job)
   * @param {String} queue - the name of the queue for this job
   * @param {String|Object} payload - the payload for the job
   * @return {Object} spec - a hash of the configured job spec
   */
  schedule: function (job) {
    var spec = new JobSpec(job);
    if (spec.cronTime) {
      app.cron.jobs.push(spec);
      if (job.title) {
        app.log.info('cron', 'CRON job scheduled: ' + job.title);
      }
    }
    return spec;
  },

  poll: function () {
    app.cron.jobs.forEach(function (job) {
      job.tryRun();
    });
  },

  start: function () {
    app.cron._interval = setInterval(app.cron.poll, conf.interval);
  },

  stop: function () {
    clearInterval(app.cron._interval);
  }
};

// After everything else has started, create the cron interval.
app.hook('start').add(2000, function (next) {
  var jobs = Array.isArray(conf.jobs) ? conf.jobs : [];
  if (conf.active) {
    jobs.forEach(app.cron.schedule);
    app.cron.poll();
    app.cron.start();
  }
  next();
});

// Job spec.
function JobSpec (job) {
  this._job = job;
  this.title = job.title;
  this.queue = job.queue;
  this.payload = job.payload;
  try {
    this.cronTime = new CronTime(job.cronTime);
  }
  catch (e) {
    app.log.error('Invalid Cron Time:' + e);
  }
}
JobSpec.prototype.onTick = function () {
  app.queue(this.queue, this.payload);
};
JobSpec.prototype.tryRun = function () {
  var job = this;

  // At some point cron's CronTime became a moment wrapper?
  var nextTime = job.cronTime.sendAt();
  if (typeof nextTime.toDate === 'function') {
    nextTime = nextTime.toDate()
  }

  // CronTime#sendAt() returns the Date of the *next* runtime
  var sendAt = timebucket(nextTime).resize('1s').toMilliseconds() // get milliseconds, though
    , key = app.redisKey('cron', job.queue, sendAt);

  // If we can set the lock for the next runtime, then we in control of
  // running any pending jobs
  app.redis.SETNX(key, sendAt, function (err, response) {
    if (err) return app.emit('error', err);
    // We got the lock (if we fail, do nothing else)
    if (response === 1) {
      // Get the keys matching this job
      app.redis.KEYS(app.redisKey('cron', job.queue, '*'), function (err, keys) {
        if (err) return app.emit('error', err);
        if (keys && keys.length) {
          keys = keys.filter(function (k) { return k !== key; });
          if (keys && keys.length) {
            // A previous key matching this job exists, i.e., a job is pending.
            // Run the job
            job.onTick();
            // Clean up the old keys
            keys.forEach(function (k) {
              app.redis.DEL(k, function (err) {
                if (err) app.emit('error', err);
              });
            });
          }
        }
      });
    }
  });
};
