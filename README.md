## Create React App Fork

## High level goals

- Inject React app directly into a rails template and get all the benefits of
  the `react-scripts`/`create-react-app` developer experience, including:
  - Amazing error messaging
  - Sensible default configuration with TypeScript
  - Performance optimizations
  - etc.

This fork adds the following customizations to react-scripts in order to
accomplish this with the MakeSchool codebase:

### Development

- Disable code splitting/chunking
- Manually set the bundle names (so we can listen to it in our Rails templates)
- Adds console-source babel plugin
- Removes HTML head and body tags from the index.html template (so we can inject
  the script into our Rails templates)

### Test

- Adds console-source babel plugin
- Automock tests (will be deprecated once we update our old specs)

### Production

- Copy build directory to the Rails public folder
- Move the index.html file to app/views/application/\_client_production.html.erb
- Adds babel-plugin-lodash to optimize lodash imports
- Remove deployment instructions from console output (irrelevant to us)
- Disable injection into index.html file so we can output an erb template
- Disable HTML minification so the erb template syntax won't throw an error
- Wrap the css links with `<% content_for :extra_head do %><% end %>`
- Wrap the js scripts with `<% content_for :extra_js do %><% end %>`

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

- That's it! Instructions will be printed to the console on how to run the
  server.

## Important notes

- All changes to the original `create-react-app` package are prefixed with a
  comment titled `UPDATED`, and will contain a description of the change
  and/or why. This should help in understanding what changes were made and why
  in case you ever have to debug it or make changes.
- This fork was created as an alternative to `eject`ing so we can upgrade the
  `react-scripts` package as needed and replicate the config easier in the
  future. It's [recommended by `create-react-app`](https://create-react-app.dev/docs/alternatives-to-ejecting).
- We should do our best to keep this fork up to date until we (potentially) change
  our codebase to use React as our sole frontend, without injecting it into
  Rails templates.

## TODO

- Publish this package, so we can run `yarn create react-app --scripts-version makeschool --template makeschool` instead of the manual instructions above.
  This isn't a priority since we'll only be setting this up once, but it would
  remove the need for installing from the monorepo (mentioned in the
  "Important notes."
