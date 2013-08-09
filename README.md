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

- - -

### License: MIT
Copyright (C) 2013 Terra Eclipse, Inc. ([http://www.terraeclipse.com](http://www.terraeclipse.com))

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is furnished
to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
