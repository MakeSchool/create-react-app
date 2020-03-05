// UPDATED
// Add setup script for scaffolding the project from scratch
// we went this route instead of creating a custom template because we need to
// do some things outside of the normal scope of things, like create an erb
// template file and put it in the rails app and create a fixtures folder that
// contains our production html file.

'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

// Ensure environment variables are read.
require('../config/env');

const fs = require('fs-extra');
const chalk = require('react-dev-utils/chalk');
const paths = require('../config/paths');
const execSync = require('child_process').execSync;

// Fail early if not in the right directory
const isNotInTheClientDirectory = !process.cwd().includes('client');

if (isNotInTheClientDirectory) {
  console.log();
  console.error(chalk.red('You must run this script in the client/ directory'));
  console.log();
  process.exit(1);
}

// Fail early if has uncommited changes
// Copied from the eject script
function getGitStatus() {
  try {
    let stdout = execSync(`git status --porcelain`, {
      stdio: ['pipe', 'pipe', 'ignore'],
    }).toString();
    return stdout.trim();
  } catch (e) {
    return '';
  }
}

const gitStatus = getGitStatus();
if (gitStatus) {
  console.error(
    chalk.red(
      'This git repository has untracked files or uncommitted changes:'
    ) +
      '\n\n' +
      gitStatus
        .split('\n')
        .map(line => line.match(/ .*/g)[0].trim())
        .join('\n') +
      '\n\n' +
      chalk.red(
        'Remove untracked files, stash or commit any changes, and try again.'
      )
  );
  process.exit(1);
}

// Pretty print logs to the console
const divider = (...messages) => {
  messages.forEach((message, index) => {
    if (index > 0) {
      console.log(`- ${message}`);
    } else {
      console.log(chalk.blue(message));
    }
  });
  console.log();
};

divider(chalk.blue('Setting up your project...'));

divider(
  'Creating app/views/application/_client.html.erb...',
  'This allows you to use <%= render "client" %> anywhere in your rails templates.',
  'It will link to the bundles served from webpack-dev-server in development and the _client_production.html.erb in production.'
);

fs.copySync(
  paths.resolveOwn('fixtures/_client.html.erb'),
  paths.resolveApp('../app/views/application/_client.html.erb')
);

divider(
  'Removing all files from client/public/...',
  'We already have these files in our Rails app.'
);

fs.emptyDirSync(paths.appPublic);

divider(
  'Adding index.html file in client/public/...',
  'This is just a <div id="root"> element that HTMLWebpackPlugin will inject the CSS and JS tags into in development.'
);

fs.copySync(
  paths.resolveOwn('fixtures/index.html'),
  paths.resolveApp('public/index.html')
);

divider(
  'Creating fixtures/index.prod.html...',
  'This is an erb file with <% content_for :extra_head %> and <% content_for :extra_js %> tags that will be served by rails in production.'
);

fs.copySync(
  paths.resolveOwn('fixtures/index.prod.html'),
  paths.resolveApp('fixtures/index.prod.html')
);

divider(
  'Updating tsconfig.json...',
  'Setting `strict: false` and adding a `src/` folder alias so we can reference import our files as `import MyComponent from "components/MyComponents"` without the relative path.'
);

fs.copySync(
  paths.resolveOwn('fixtures/tsconfig.json'),
  paths.resolveApp('tsconfig.json')
);

divider(
  'Adding env variables to .env.development...',
  'These ignore the preflight check since we have a package.json in the root directory of our rails app and set the port to 3001 since we run rails on port 3000.'
);

fs.copySync(
  paths.resolveOwn('fixtures/.env.development'),
  paths.resolveApp('.env.development')
);

divider(
  'Adding env variables to .env.production...',
  ' So we can ignore the preflight check during the build too.'
);

fs.copySync(
  paths.resolveOwn('fixtures/.env.production'),
  paths.resolveApp('.env.production')
);

divider(chalk.green('Setup complete.'));

divider(
  'Run `bin/rails dev:backend` in one terminal and `bin/rails dev:client` in another to get started.',
  'Happy coding!'
);
