import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'c3/c3.min.css';
import 'react-widgets/dist/css/react-widgets.css';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
