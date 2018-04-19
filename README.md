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

App.js is a straightforward React app with JavaScript functions supporting it. When loaded, it defaults the selected cast to the first one in the list received from the back-end API. It then gets the last 15min worth of data for the selected cast.

Changing the selected cast will not automatically reload the data; you must then press the Refresh button.

The actual HTML that is served is located in the public folder.

## New Data Event

When data is sent by a device a notification appears in the UI notifying the user. This is achieved using a third party channel service called Pusher. When the back-end receives new data, it publishes a "new-data" event to pusher and this UI is subscribed to such new-data events via the `channel.bind` statement in App's constructor.

## Ideas For Future Development

This is not a complete list, just some ideas. In terms of a whole clinician system a LOT more functionality could be added.

* The API key used to subscribe to Pusher is from Ben's account. If future developers decide to keep using Pusher, they'll need to make their own pusher account and replace the key with their own.
* If the FE and BE were merged into a single app, the pub-sub functionality could be implemented without a third-party service. Frameworks like Springboot and Phoenix have mechanisms for this built-in.
* The UI needs a complete overhaul. What is implemented here was really just a proof of concept, done by two software folks who had no experience with front end web development. Someone who knows what they're doing with CSS and HTML could quickly make something better.
* Thresholds and threshold alerts were never implemented in the system as a whole.
* A database for patient data needs to be implemented.
* For commercialization, an automated process will need to be implemented that:
  * Activates a new SIM card in Hologram, gives it a name, gets its device key for the device hardware
  * Associates the device name with a patient in the as-yet-to-be-implemented patient database
* A system for notifying doctors needs to be implemented so they don't have to keep manually checking the website

### Known Bugs

* C3js does not play nicely with React. Problems include:
  * When changing casts and time interval, new data does not always display properly.
  * Year, day, and time of day display correctly, but the month is stuck on January.
* Bootstrap does not seem to play nicely with React either, or possibly Node. It seems to randomly disobey it's supposed functionality.