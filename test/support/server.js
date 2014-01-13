var sfs = require('sfs');

sfs.start({
  rootDir: __dirname + '/.tmp',
  enableCluster: false,
  port: 7001,
  nodes: [
  ],
});
