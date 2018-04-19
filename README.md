# CastBuddy Front-End

This is the GUI of the CastBuddy server-side software. It uses:

* [NodeJS](https://nodejs.org/en/) for package management
* [ReactJS](https://reactjs.org/) for live updating of GUI state
* [Bootstrap](https://getbootstrap.com/) for rapid UI development
* [C3js](http://c3js.org/) for graphing data
* [pusher-js](https://github.com/pusher/pusher-js) for subscribing to [Pusher](https://pusher.com/) event channels
* ReactWidget's [DateTimePicker](https://jquense.github.io/react-widgets/api/DateTimePicker/) for the date/time pickers

The project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app) for React scaffolding and npm scripts.

## Development

Getting started with the node framework is simple:

1. Install node on your system
1. `cd` into the repo root and run `npm i`

Make any changes you'd like to the code. To test the app:

1. You need an instance of the [CastBuddy API](https://github.com/neuenablingengineering/castbuddy-api) running locally, as this app makes calls to localhost/api. Go clone that repo and get an instance running first.
1. In this repo's root run `npm start`. Node should open a web browser for you to http://localhost:3000/.

You can continue to make code changes while the dev server is running and node will automatically reload the code in browser.

## Deployment

When you run `npm start` you'll see the following message in the command line:

```
Note that the development build is not optimized.
To create a production build, use npm run build.
```

Whenever you're ready to run this app on a server 'for real', running `npm run build` will package the app into a flat folder called "build" that can be served as static files. You can do this step locally or on a build server then zip up this file for delivery to a deploy server, or, as we did for the sake of time, just install git and npm on your deploy server, clone the repo, and run `npm i && npm run build` in the repo root on the server itself. You can then serve the contents of the build folder however you'd like. Some options include:

1. Using a static web server like nginx (what we did, because we also used nginx for reverse proxy routes).
1. Use a production-ready node server like nodemon.

## Project Structure

A quick look at this repo will reveal this web app is very simple; it's only a single page. index.js is the entrypoint; all this file does is create an instance of App.js.

App.js is a straightforward React app with JavaScript functions supporting it. On startup