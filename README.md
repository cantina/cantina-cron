cantina-cron
============

An amino/redis-powered in-app crontab.

Dependencies
------------

- [cantina-redis](https://github.com/cantina/cantina-redis)
- [cantina-queue](https://github.com/cantina/cantina-queue)
- A Redis server
- A RabbitMQ server

Provides
--------

- **app.cron** - The Cron API

Configuration
-------------

Though you can manually schedule jobs via the api, the more common way to setup
your's app's jobs is through your configuration.

```js
{
  "cron": {
    "active": true
    "jobs": [
      {
        title: 'News Aggregator'
        cronTime: '* * * * *'
        queue: 'aggregator:queue'
        payload: {}
      },
      {
        title: 'Check Approaching Resource Expiration'
        cronTime: '0 0 * * *'
        queue: 'resource:expiration:check'
        payload: {}
      }
    ]
  }
}
```

Usage
-----

If `app.conf.get('cron:active') === true` then your cron jobs will start being
polled as soon as `app.start()` is called. The `queue` values of jobs should
map to queue workers in your app.

API
---

**app.cron.schedule (job)**

Schedule a job. See the config example above for job format.

**app.cron.start**

Start the cron interval.

**app.cron.stop**

Stop the cron interval.

**app.cron.poll**

Manually trigger a poll through the cron jobs.


- - -

### Developed by [TerraEclipse](https://github.com/TerraEclipse)

Terra Eclipse, Inc. is a nationally recognized political technology and
strategy firm located in Santa Cruz, CA and Washington, D.C.
