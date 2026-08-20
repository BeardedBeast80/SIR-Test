/*
 * Scaffolds the native Android/TWA (Trusted Web Activity) project from
 * twa-manifest.json, without going through Bubblewrap's interactive `init`
 * wizard (which can't run non-interactively in CI). This calls the same
 * @bubblewrap/core library functions the CLI uses internally, directly.
 *
 * Run from inside this `android/` folder: `node generate-project.js`
 * (the GitHub Actions workflow does this for you).
 */
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { TwaManifest, TwaGenerator, ConsoleLog } = require('@bubblewrap/core');

const ROOT = __dirname;
const manifestFile = path.join(ROOT, 'twa-manifest.json');

(async () => {
  console.log('Reading', manifestFile);
  const twaManifest = await TwaManifest.fromFile(manifestFile);

  console.log('Scaffolding Android project into', ROOT);
  const generator = new TwaGenerator();
  const log = new ConsoleLog('generate-twa');
  await generator.createTwaProject(ROOT, twaManifest, log, (current, total) => {
    process.stdout.write(`  ...${Math.round((current / total) * 100)}%\r`);
  });

  // Write the checksum file Bubblewrap uses to detect manifest changes.
  // Its presence (matching the current manifest) is what lets `bubblewrap
  // build` run without prompting to confirm a project update.
  const manifestContents = fs.readFileSync(manifestFile);
  const checksum = crypto.createHash('sha1').update(manifestContents).digest('hex');
  fs.writeFileSync(path.join(ROOT, 'manifest-checksum.txt'), checksum);

  console.log('\nDone. Android project ready for `bubblewrap build`.');
})().catch((err) => {
  console.error('Failed to scaffold the Android project:', err);
  process.exit(1);
});
