# Convex

This example demonstrates the Convex global state management framework.

## Deploy your own

Deploy the example using [Vercel](https://vercel.com?utm_source=github&utm_medium=readme&utm_campaign=next-example):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/vercel/next.js/tree/canary/examples/convex&project-name=convex&repository-name=convex)

## How to use

Execute [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) with [npm](https://docs.npmjs.com/cli/init), [Yarn](https://yarnpkg.com/lang/en/docs/cli/create/), or [pnpm](https://pnpm.io) to bootstrap the example:

```bash
npx create-next-app --example convex convex-app
# or
yarn create next-app --example convex convex-app
# or
pnpm create next-app --example convex convex-app
```

Run

```bash
npm run dev
```

to run `next dev` and a Convex file watcher at the same time. This command will log you into Convex, so you'll need to create a Convex account if this is your first project.

Once everything is working, commit your code and deploy it to the cloud with [Vercel](https://vercel.com/new?utm_source=github&utm_medium=readme&utm_campaign=next-example) ([Docation](https://nextjs.org/docs/deployment)).

Use `npx convex deploy && npm run build` as the build command and set the `CONVEX_DEPLOY_KEY` environmental variable in Vercel ([Docation](https://docs.convex.dev/getting-started/deployment/hosting/vercel)).
