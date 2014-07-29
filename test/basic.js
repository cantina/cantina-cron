describe('basic test', function () {
  var app;

  before(function (done) {
    app = require('cantina').createApp();
    app.boot(function (err) {
      if (err) return done(err);
      app.silence();
      app.conf.set('redis:prefix', 'cantina-cron-test-' + Date.now());
      app.require('../');
      app.start(done);
    });
  });

  after(function (done) {
    app.destroy(done);
  });

  it('can schedule a job', function () {
    var job;
    app.cron.schedule({
      title: 'Test One',
      cronTime: '* * * * *',
      queue: 'test:one',
      payload: {test: 'one'}
    });
    assert.equal(app.cron.jobs.length, 1);
    job = app.cron.jobs.pop();
    assert.equal(job.title, 'Test One');
  });

  it('can run a job (takes two minutes)', function (done) {
    this.timeout(130 * 1000);

    app.cron.schedule({
      title: 'Test Two',
      cronTime: '* * * * *',
      queue: 'test:two',
      payload: {test: 'two'}
    });

    app.amino.process('test:two', function (payload, cb) {
      assert.equal(payload.test, 'two');
      done();
    });

    app.cron.start();
  });
});
