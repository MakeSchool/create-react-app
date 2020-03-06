## Create React App Fork

This is a fork of create-react-app for the Make School codebase.

## High level goals

- Inject React app directly into a rails template and get all the benefits of
  the `react-scripts`/`create-react-app` developer experience, including:
  - Amazing error messaging
  - Sensible default configuration with TypeScript
  - Performance optimizations
  - etc.

## Features

This fork adds the following customizations to react-scripts in order to
accomplish this with the MakeSchool codebase:

### Development

- Disable code splitting/chunking
- Manually set the bundle names (so we can listen to it in our Rails templates)
- Adds `babel-plugin-console-source`
- Creates a custom rails partial called `client` that we can drop in any rails
  template to mount react.

### Test

- Adds console-source babel plugin
- Automock tests (will be **deprecated** once we update our old specs)

### Production

- Copy `build/` directory to the Rails public folder
- Move `index.html` to `app/views/application/\_client_production.html.erb`
- Adds `babel-plugin-lodash` to optimize lodash imports
- Remove deployment instructions from console output (irrelevant to us)
- Disable injection into `index.html` so we can output an erb template
- Disable HTML minification so the erb template syntax won't throw an error
- Wrap the css links with `<% content_for :extra_head do %><% end %>`
- Wrap the js scripts with `<% content_for :extra_js do %><% end %>`

> For more details information, see the "Low-level Details" section below.

## Getting started

- Create a new React app in `client/` with the typescript template

```bash
yarn create react-app client --template typescript
```

- Install the forked version of react-scripts in the `client/` directory

```bash
cd client
yarn add
yarn add https://gitpkg.now.sh/makeschool/create-react-app/packages/react-scripts
```

> When yarn supports installing from monorepos, we can change this url to pull
> directly from our repo. For now, gitpkg.now.sh is an open source service that
> adds this functionality for us.

- Run the setup script

```bash
yarn react-scripts setup
```

- Add the following rake task to `build.rake`

```ruby
task client: :environment do
  puts "Running client build scripts..."

  system <<~BASH
    echo "Removing node_modules/ from root directory to avoid dependency
    conflicts..."
    rm -rf node_modules

    echo "Installing client/node_modules/..."
    yarn --cwd client

    echo "Running build script..."
    yarn build --cwd client
  BASH
end

# Ensure it runs on `bin/rails assets:precompile` script during production build
Rake::Task['assets:precompile'].enhance ['client:build']
```

- That's it! Instructions will be printed to the console on how to run the
  server.

## Important notes

- This fork was created as an alternative to `eject`ing so we can upgrade the
  `react-scripts` package as needed and replicate the config easier in the
  future. It's [recommended by `create-react-app`](https://create-react-app.dev/docs/alternatives-to-ejecting).
- All changes to the original `create-react-app` are prefixed with a
  comment titled `UPDATED`, and will contain a description of the change
  and/or why. This should help in understanding what changes were made and why
  in case you ever have to debug it or make changes.
- We should do our best to keep this fork up to date until we (potentially) change
  our codebase to use React as our sole frontend, without injecting it into
  Rails templates.

## Low level details

This is to serve as a reference to what changes were made and why. It can be
used as a teaching tool to custom configuration and to help maintain/debug in the future. **Any changes made to this repo should be reflected here so we can keep it as a source of truth over time.**

### react-scripts/config/webpack.config.js

- We remove the `chunkFilename` option in development so we know the exact name
  of the bundles. We reference these paths in the `_client.html.erb` partial
  that Rails renders, i.e. `<script src="http://localhost:3001/static/js/bundle.js">`.
- We only inject the `<head>` and `<body>` tags with HTMLWebpackLoader in
  development. In production, we use a custom template that wraps the CSS and
  JS scripts in our erb `content_for` functions so they're rendered correctly
  in the layout.
- We remove HTML minification, so it doesn't throw an error when it sees the
  erb syntax in production, and rails will minify it anyways.
- We customize the HTMLWebpackPlugin templates. For development, we just have a
  `<div id="root">` and let the plugin inject the JS and CSS HTML tags. For
  production, we use the erb template mentioned above.

### react-scripts/scripts/setup

This script scaffolds the files needed for our custom setup.

- Creates a partial at `app/views/application/_client.html.erb` that will
  render the hardcoded scripts for the webpack-dev-server in development, or
  the built bundle in production.
- Removes all files from the `client/public/` directory. We don't need a
  `manifest.json`, `robots.txt`, etc. since we already have that in our rails
  app.
- Adds the custom `index.html` file with `<div id="root">` for development
  (mentioned in webpack.config.js as well).
- Adds the `index.prod.html` file in a new folder at `client/fixtures/` that we
  use for the production build. We put it here so it's not copied in our build
  (which would happen if it was included in `public`) and name it this way so
  HTMLWebpackLoader will know how to compile it. It uses the Lodash template
  language by default.
- Alters our
  `client/tsconfig.json` file to set `strict: false` and allow us to import
  relative from the `src/` directory, i.e. `import MyComponent from 'components/MyComponent'`.
- Adds a `client/.env.development` file with variables for setting the ports nd
  webpack-dev-server ports to 3001, since we run rails on port 3000. And also
  skips the preflight check since we have node_modules in the rails root
  folder as well.
- Adds `client./.env.production` to also skip the preflight check.

### react-scripts/scripts/build

- Copies the `client/build` folder to `public/` so rails will have access to it
  in the script tags that are output in the production html file, i.e. `<script src="/static/js/bundle.js">`.
- Moves the `index.html` file generated by webpack to
  `app/views/application/_client_production/html.erb`. This partial is
  rendered by the partial created during the setup script when
  `Rails.env.production? == true`.
- Remove the `printDeploymentInstructions` logs to the console, since they're
  irrelevant to our use case.

### react-scripts/scripts/utils/createJestConfig.js

- Sets `automock: true`. We'd like to remove this in the near future, but right
  now about 100 of our legacy tests would break without this option being
  true.

### react-scripts/config/paths.js

- Export the `resolveApp` and `resolveOwn` path helpers for use in the setup and
  build script additions.
- Add `appHtmlProd` path, so we can reference it later during the build step.

### babel-preset-react-app/create.js

- Add `babel-plugin-lodash` on production config. This roughly turns Lodash
  imports like
  `import { get } from 'lodash'` into a smaller `import get from 'lodash/get'`
  so we'll have a smaller bundle size.
- Adds `babel-plugin-console-source` plugin to show the file and line number to
  where a `console` function is called during development and test
  environments. Helpful for debugging.

## License

MIT

## Contributing

This repo will only accept changes from the Make School engineering team for the
forseeable future, as it is extremely focused on only our specific use case.

If you're a Make School Engineer, follow these steps to make changes:

### Making changes

- Clone this repo
- Make changes (don't forget to update the README with what files/changes you
  made)
- Create a pull request
- Get at least one review before merging

### Updating the fork

- Clone this repo
- Add the official repo as an upstream
- Pull the latest changes from master
- Create a pull request
- Get at least one review before merging

## TODO

- Publish this package, so we can run `yarn create react-app --scripts-version makeschool --template makeschool` instead of the manual instructions above.
  _This isn't a priority since we'll only be setting this up once, but it would
  remove the need for installing from the monorepo (mentioned in "Getting
  started)."_
