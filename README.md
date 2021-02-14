[![Blitz.js](https://raw.githubusercontent.com/blitz-js/art/master/github-cover-photo.png)](https://blitzjs.com)

This is a [Blitz.js](https://github.com/blitz-js/blitz) app.

# **name**

## Getting Started

Run your app in the development mode.

```
blitz start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Ensure the `.env.local` file has required environment variables:

```
DATABASE_URL=postgresql://<YOUR_DB_USERNAME>@localhost:5432/blitzapp
```

Ensure the `.env.test.local` file has required environment variables:

```
DATABASE_URL=postgresql://<YOUR_DB_USERNAME>@localhost:5432/blitzapp_test
```

## Tests

Runs your tests using Jest.

```
blitz test
or
yarn test
```

Blitz comes with a test setup using [Jest](https://jestjs.io/) and [react-testing-library](https://testing-library.com/).

## Commands

Blitz comes with a powerful CLI that is designed to make development easy and fast. You can install it with `npm i -g blitz`

```
  blitz [COMMAND]

  build     Create a production build
  console   Run the Blitz console REPL
  db        Run database commands
  generate  Generate new files for your Blitz project
  help      display help for blitz
  start     Start a development server
  test      Run project tests
```

You can read more about it on the [CLI Overview](https://blitzjs.com/docs/cli-overview) documentation.

## What's included?

Here is the structure of your app.

```
blitzapp
├── app
│   |── auth
│   │   ├── components
│   │   │   └── LoginForm.tsx
│   │   ├── mutations
│   │   │   ├── login.ts
│   │   │   ├── logout.ts
│   │   │   └── signup.ts
│   │   └── pages
│   │       ├── login.tsx
│   │       └── signup.tsx
│   ├── auth-utils.ts
│   ├── validations.ts
│   ├── components
│   │   ├── Form.tsx
│   │   └── LabeledTextField.tsx
│   ├── hooks
│   │   └── useCurrentUser.ts
│   ├── layouts
│   │   └── Layout.tsx
│   │── pages
│   │   ├── _app.tsx
│   │   ├── _document.tsx
│   │   ├── 404.tsx
│   │   ├── index.tsx
│   │   └── index.test.tsx
│   └── users
│   │   └── queries
│   │       └── getCurrentUser.ts
├── db
│   ├── migrations
│   ├── index.ts
│   └── schema.prisma
├── integrations
├── node_modules
├── public
│   ├── favicon.ico
│   └── logo.png
├── test
│   ├── __mocks__
│   │       └── fileMock.js
│   ├── setup.ts
│   └── utils.tsx
├── utils
├── .env
├── .eslintrc.js
├── .gitignore
├── .npmrc
├── .prettierignore
├── babel.config.js
├── blitz.config.js
├── jest.config.js
├── package.json
├── README.md
├── tsconfig.json
└── yarn.lock
```

These files are:

- The `app/` directory is a container for most of your project. This is where you’ll put any pages or API routes.

- `db`/ is where your database configuration goes. If you’re writing models or checking migrations, this is where to go.

- `node_modules/` is where your “dependencies” are stored. This directory is updated by your package manager, so you don’t have to worry too much about it.

- `public/` is a directory where you will put any static assets. If you have images, files, or videos which you want to use in your app, this is where to put them.

- `test/` is a directory where you can put your unit and integration tests.

- `utils/` is a good place to put any shared utility files which you might use across different sections of your app.

- `.babelrc.js`, `.env`, etc. ("dotfiles") are configuration files for various bits of JavaScript tooling.

- `blitz.config.js` is for advanced custom configuration of Blitz. It extends [`next.config.js`](https://nextjs.org/docs/api-reference/next.config.js/introduction).

- `jest.config.js` contains config for Jest tests. You can [customize it if needed](https://jestjs.io/docs/en/configuration).

- `package.json` contains information about your dependencies and devDependencies. If you’re using a tool like `npm` or `yarn`, you won’t have to worry about this much.

- `tsconfig.json` is our recommended setup for TypeScript.

You can read more about it in the [File Structure](https://blitzjs.com/docs/file-structure) section of the documentation.

## Learn more

Read the [Blitz.js Documentation](https://blitzjs.com/docs/getting-started) to learn more.

### The Blitz.js Manifesto

Read the [Blitz Manifesto](https://blitzjs.com/docs/manifesto) to learn the Blitz foundational principles.

Blitz is built on Next.js. For more info on this see [Why use Blitz instead of Next.js](https://blitzjs.com/docs/why-blitz)

## Get in touch

The Blitz community is warm, safe, diverse, inclusive, and fun! Feel free to reach out to us in any of our communication channels.

- [Website](https://blitzjs.com/)
- [Slack](https://slack.blitzjs.com/)
- [Report an issue](https://github.com/blitz-js/blitz/issues/new/choose)
- [Forum discussions](https://github.com/blitz-js/blitz/discussions)
- [Sponsors and donations](https://github.com/blitz-js/blitz#sponsors-and-donations)
- [Contributing Guide](https://blitzjs.com/docs/contributing)
