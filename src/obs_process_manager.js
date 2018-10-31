const { spawn } = require('child_process');

exports.ObsProcessManager = class {
  constructor(court_id) {
    this.court_id = court_id;
    this.obs_config_root_path = `./obs_data/configs/${court_id}/`;
    this.process = null;
  }

  async kill() {
    if (!this.is_running()) {
      return;
    }

    console.log(`Killing ${this.court_id}`);
    const killed_promise = new Promise((resolve, reject) => {
      this.process.on('exit', () => resolve());
    });

    this.process.kill();
    this.process = null;

    await killed_promise;
  }

  async start() {
    if (this.is_running()) {
      return;
    }

    console.log(`Starting ${this.court_id}`);
    this.process = spawn('obs',
      [
        '--startstreaming',
        '--profile', this.court_id,
      ]
    );
  }

  async set_is_live(is_live) {
    if (is_live) {
      await this.start();
    } else {
      await this.kill();
    }
  }

  is_running() {
    return this.process != null;
  }
};
