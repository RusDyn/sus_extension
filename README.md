This is a Chrome Extenstion for YC Startup School Cofounder Match platfrom 
It helps to receive summary for each potential cofoinder profile and get througn this process faster 

## 
## Usage

- Download ready to use extension
- Install to your Chrome browser locally
- Go to your profile page on SUS and enter OpenAI API keys
- Go to matchmaking platform, wait for 20 second and receive summary 

This extension doesn't use any backend and stores everything in your local browser's cache.

## Run and build manually
This extensiob bootstrapped with [`Plasmo`](https://www.npmjs.com/package/plasmo).

Run the development server:

```bash
pnpm dev
# or
npm run dev
```

Open your browser and load the appropriate development build. For example, if you are developing for the chrome browser, using manifest v3, use: `build/chrome-mv3-dev`.
For further guidance to Plasmo, [visit our Documentation](https://docs.plasmo.com/)

## Making production build

Run the following:

```bash
pnpm build
# or
npm run build
```

This should create a production bundle for your extension, ready to be zipped and published to the stores.
