# tracker-base

Base for the Tesla website tracking

## Pre requisites

- [yarn](https://yarnpkg.com/)

## Config

The config is available in `config.ts`

Make your `GH_TOKEN` available as an environment variable ([see how](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token))

Adding a `DEV` environment variable will prevent any real push and use a dummy domain for testing purpose

## Scripts

### `yarn start`

- Run the scrapper

### `yarn start-env`

- Run the scrapper but get the environment variables from the .env file
