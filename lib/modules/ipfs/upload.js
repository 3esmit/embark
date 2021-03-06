require('colors');
let async = require('async');
let shelljs = require('shelljs');

class IPFS {

  constructor(options) {
    this.options = options;
    this.buildDir = options.buildDir || 'dist/';
    this.storageConfig = options.storageConfig;
    this.configIpfsBin = this.storageConfig.ipfs_bin || "ipfs";
  }

  deploy() {
    return new Promise((resolve, reject) => {
      console.log("deploying to ipfs!");
      let self = this;
      async.waterfall([
        function findBinary(callback) {
          let ipfs_bin = shelljs.which(self.configIpfsBin);

          if (ipfs_bin === 'ipfs not found' || !ipfs_bin) {
            console.log(('=== WARNING: ' + self.configIpfsBin + ' ' + __('not found or not in the path. Guessing %s for path', '~/go/bin/ipfs')).yellow);
            ipfs_bin = "~/go/bin/ipfs";
          }

          callback(null, ipfs_bin);
        },
        function runCommand(ipfs_bin, callback) {
          let cmd = `"${ipfs_bin}" add -r ${self.buildDir}`;
          console.log(("=== " + __("adding %s to ipfs", self.buildDir)).green);
          console.debug(cmd);
          shelljs.exec(cmd, {silent:true}, function(code, stdout, stderr){ // {silent:true}: don't echo cmd output so it can be controlled via logLevel
            console.log(stdout.green);
            callback(stderr, stdout);
          });
        },
        function getHashFromOutput(result, callback) {
          let rows = result.split("\n");
          let dir_row = rows[rows.length - 2];
          let dir_hash = dir_row.split(" ")[1];

          callback(null, dir_hash);
        },
        function printUrls(dir_hash, callback) {
          console.log(("=== " + __("DApp available at") + " http://localhost:8080/ipfs/" + dir_hash + "/").green);
          console.log(("=== " + __("DApp available at") + " http://gateway.ipfs.io/ipfs/" + dir_hash + "/").green);

          callback();
        }
      ], function (err, _result) {
        if (err) {
          console.log(__("error uploading to ipfs").red);
          console.log(err);
          reject(err);
        }
        else resolve(__('successfully uploaded to ipfs'));
      });
    });
  }
}

module.exports = IPFS;
