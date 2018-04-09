import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'c3/c3.min.css';
import 'react-widgets/dist/css/react-widgets.css';
import 'bootstrap';
import React, { Component } from 'react';
import c3 from 'c3';
import Moment from 'moment';
import momentLocalizer from 'react-widgets-moment';
import simpleNumberLocalizer from 'react-widgets-simple-number';
import DateTimePicker from 'react-widgets/lib/DateTimePicker';
import Pusher from 'pusher-js';

Moment.locale('en');
momentLocalizer();
simpleNumberLocalizer();

let getApiRoot = '/api/';

// Enable pusher logging - don't include this in production
Pusher.logToConsole = true;

const pusher = new Pusher('d9cc11a3fe140178060c', {
  encrypted: true
});

const channel = pusher.subscribe('data');

class App extends Component {
  constructor(props) {
    super(props);

    // initialize casts list
    let selectedCast = getDefaultCast();
    let casts = getCasts();

    // initialize dates
    let endTime = new Date();
    let startTime = new Date();
    //let startDate = startTime.getDate();
    let startMin = startTime.getMinutes();
    //startTime.setDate(startDate - 1);       // last 24 hours
    startTime.setMinutes(startMin - 15);      // last 15 min

    // initialize selected sensors
    let selectedSensors = [];
    for(let i = 0; i < 16; i++) {
      selectedSensors.push(true);
    }

    // load initial data
    let startTimeString = Moment(startTime).format('YYYYMMDDHHmmss');
    let endTimeString = Moment(endTime).format('YYYYMMDDHHmmss');
    let getData = getDataFromApi(selectedCast, startTimeString, endTimeString);
    let points = parseMessage(getData);
    //console.log(getData);

    channel.bind('new-data', data => this.alertNewData(data.message));

    this.state = {
      selectedCast: 'Cast-RISE',
      casts: casts,
      points: points,
      startTime: startTime,
      endTime: endTime,
      selectedSensors: selectedSensors,
      alerts: []
    };

    // Flag used for managing chart redraws
    this.dataUpdate = false;
  }

  /* Callback Functions */

  alertNewData(cast) {
    let newAlerts = this.state.alerts;
    newAlerts.push([<NewDataAlert key="1" cast={cast} onClick={() => this.reloadPage()} />]);

    this.setState(
      {
        alerts: newAlerts
      }
    );
  }

  reloadPage() {
    window.location.reload(true);
  }

  reloadFromAlert(cast) {
    //console.log('Reloading data for cast ' + cast);

    // Set flag for chart to be redrawn
    this.dataUpdate = true;

    // Make sure cast is part of cast list
    let newCasts = this.state.casts;
    if (newCasts.indexOf(cast, 0) === -1) {
      newCasts.push(cast);
    }

    // re-initialize dates
    let endTime = new Date();
    let startTime = new Date();
    //let startDate = startTime.getDate();
    let startMin = startTime.getMinutes();
    //startTime.setDate(startDate - 1);       // last 24 hours
    startTime.setMinutes(startMin - 15);      // last 15 min

    // load data
    let startTimeString = Moment(startTime).format('YYYYMMDDHHmmss');
    let endTimeString = Moment(endTime).format('YYYYMMDDHHmmss');
    let getData = getDataFromApi(cast, startTimeString, endTimeString);

    // set state, including changing cast and clearing alerts
    this.setState(
      {
        selectedCast: cast,
        casts: newCasts,
        startTime: startTime,
        endTime: endTime,
        points: parseMessage(getData),
        alerts: []
      }
    );
  }

  loadNewData() {
    // Set flag for chart to be redrawn
    this.dataUpdate = true;

    let startTimeString = Moment(this.state.startTime).format('YYYYMMDDHHmmss');
    let endTimeString = Moment(this.state.endTime).format('YYYYMMDDHHmmss');
    let apiData = getDataFromApi(this.state.selectedCast, startTimeString, endTimeString);

    let newState = {
      points: parseMessage(apiData)
    };

    //console.log("Loaded new data");

    this.setState(newState);
  }

  processStartTime(value) {
    let newState = {
      startTime: value
    };

    this.setState(newState);
  }

  processEndTime(value) {
    let newState = {
      endTime: value
    };

    this.setState(newState);
  }

  processCastChange(e) {
    let newState = {
      selectedCast: e.target.value
    };

    this.setState(newState);
  }

  processSensorChange(e, i) {
    let newSelectedSensors = this.state.selectedSensors;

    if (e.target.checked) {
      newSelectedSensors[i] = true;
      this.chart.show('s'+(i+1).toString());
    } else {
      newSelectedSensors[i] = false;
      this.chart.hide('s'+(i+1).toString());
    }

    let newState = {
      selectedSensors: newSelectedSensors
    };

    this.setState(newState);
  }

  showAllSensors() {
    this.chart.show();
    this.toggleAllSensors(true);
  }

  hideAllSensors() {
    this.chart.hide();
    this.toggleAllSensors(false);
  }

  /* Internal Functions */

  toggleAllSensors(value) {
    let newSelectedSensors = this.state.selectedSensors.map(() => value);

    let newState = {
      selectedSensors: newSelectedSensors
    };

    this.setState(newState);
  }

  renderSensorList() {
    let sensors = [];

    for(let i = 0; i < 16; i++) {
      let id = 'slist_s' + i.toString();
      let label = 'Sensor ' + (i+1).toString();
      let checked = this.state.selectedSensors[i];

      sensors.push(<SensorListItem key={id} id={id} label={label} checked={checked} onChange={event => this.processSensorChange(event, i)} />);
    }

    return sensors;
  }

  getHideMatrix() {
    let mtx = [];
    for(let i = 0; i < this.state.selectedSensors.length; i++) {
      if(!this.state.selectedSensors[i]) {
        mtx.push('s'+(i+1).toString());
      }
    }

    return mtx;
  }

  // Must be called after initial render
  generateChart() {
    let data = {
      x: 'x',
      xFormat: '%Y%M%d%H%M%S',
      rows: this.state.points,
      //type: 'spline',
      hide: this.getHideMatrix()
    };

    let axis = {
      x: {
        type: 'timeseries',
        tick: {
          format: '%d %b %Y %I:%M:%S%p'
        }
      }
    };

    let chartConfig = {
      //bindto: document.getElementById('chart'),
      data: data,
      axis: axis
    };

    return c3.generate(chartConfig);
  }

  // Unloads then re-loads data. Only call when necessary.
  updateChartData() {
    this.chart.unload();

    // Only load data if there is data to load.
    // This ensures the chart doesn't show erroneous data.
    if(this.state.points.length !== 0) {
      this.chart.load({rows: this.state.points});
    }
  }

  render() {
    // Only re-render chart when necessary
    if (this.dataUpdate) {
      this.updateChartData();
      this.dataUpdate = false;
    }

    return (
      <div className="container-fluid">
        <p className="h1 text-center">CastBuddy Prototype UI</p>
        <hr />
        <div className="row align-items-center">
          <div className="col-3">
            <CastSelectMenu casts={this.state.casts} value={this.state.selectedCast} onChange={event => this.processCastChange(event)} />
          </div>
          <div className="col">{this.state.alerts}</div>
        </div>
        <div className="row pt-3">
          <div className="col-3">
            <div className="card">
              <div className="card-header">
                <div className="row">
                  <div className="col-6 align-self-center">Sensors</div>
                  <div className="btn-group" role="group" aria-label="Select all/none buttons">
                    <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => this.showAllSensors()}>All</button>
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => this.hideAllSensors()}>None</button>
                  </div>
                </div>
              </div>
              <div className="card-body">
                {this.renderSensorList()}
              </div>
            </div>
          </div>
          <div className="col-9">
            <div className="row">
              <div id="chart"></div>
            </div>
            <div className="row align-items-center">
              <div className="col-1 text-right">From:</div>
              <div className="col"><DateTimePicker dropUp value={this.state.startTime} max={this.state.endTime} onChange={startTime => this.processStartTime(startTime)}/></div>
              <div className="col-1 text-right">To:</div>
              <div className="col"><DateTimePicker dropUp value={this.state.endTime} max={new Date()} min={this.state.startTime} onChange={endTime => this.processEndTime(endTime)} /></div>
              <div className="col-1"><button type="button" className="btn btn-outline-primary" onClick={() => this.loadNewData()}>Refresh</button></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    this.chart = this.generateChart();
  }

  // Only thing need to worry about is destroying chart
  componentWillUnmount() {
    if(this.chart) {
      try {
        this.chart = this.chart.destroy();
      } catch (err) {
        throw new Error('Internal C3 error', err);
      }
    }
  }

}

export default App;

function NewDataAlert(props) {
  return (
    <div className="alert alert-primary align-middle" role="alert">
      New data is available for cast {props.cast}
      <button type="button" className="btn py-0 btn-outline-primary btn-sm float-right" onClick={props.onClick}>Reload</button>
    </div>
  );
}

function CastSelectMenu(props) {
  let elements = [];

  props.casts.forEach((cast, idx) => {
    elements.push(<option key={idx.toString()}>{cast}</option>);
  });

  return (
    <select className="formControl" onChange={props.onChange} value={props.value}>
      {elements}
    </select>
  );
}

function SensorListItem(props) {
  return (
    <div className="form-check">
      <input className="form-check-input" type="checkbox" value="" id={props.id} onChange={props.onChange} checked={props.checked ? 'checked' : false}/>
      <label className="form-check-label" htmlFor={props.id}>{props.label}</label>
    </div>
  );
}

function getCasts() {
  let targetUrl = `${getApiRoot}chip/select/all`;
  let req = new XMLHttpRequest();
  //console.log(req);
  req.open('GET', targetUrl, false);
  req.send(null);
  return JSON.parse(req.responseText);
}

function getDefaultCast() {
  let casts = getCasts();
  return casts[casts.length-1];
}

function parseMessage(data) {
  let vals = [];

  // assembling an array that looks like:
  //   [
  //     ['x',       's1', 's2', ...],
  //     [timestamp, val0, val1, ...],
  //     [timestamp, val0, val1, ...],
  //      .
  //      .
  //      .
  //   ]

  if(data.length !== 0) {
    vals.push(['x','s1','s2','s3','s4','s5','s6','s7','s8','s9','s10','s11','s12','s13','s14','s15','s16']);
    data.forEach(function(ct) {
      vals.push([ct.t].concat(ct.v));
    });
  }

  return vals;
}

function getDataFromApi(cast, start, end) {
  let targetUrl = `${getApiRoot}data/select?chip=${cast}&start=${start}&end=${end}`;
  let req = new XMLHttpRequest();
  //console.log(req);
  req.open('GET', targetUrl, false);
  req.send(null);
  return JSON.parse(req.responseText);
}
