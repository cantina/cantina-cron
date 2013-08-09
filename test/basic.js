describe('basic test', function () {
  var app;

  before(function (done) {
    app = require('cantina');
    app.boot(function (err) {
      if (err) return done(err);
      app.silence();
      require('../');
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

});
