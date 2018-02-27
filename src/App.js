import React, { Component } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'c3/c3.min.css';
import 'react-widgets/dist/css/react-widgets.css';
import C3Chart from 'react-c3js';
import Moment from 'moment';
import momentLocalizer from 'react-widgets-moment';
import simpleNumberLocalizer from 'react-widgets-simple-number';
import DateTimePicker from 'react-widgets/lib/DateTimePicker';

Moment.locale('en');
momentLocalizer();
simpleNumberLocalizer();

let getApiRoot = 'http://cbapi-dev.us-east-1.elasticbeanstalk.com/api/';

class App extends Component {
  constructor(props) {
    super(props);

    let selectedCast = getDefaultCast();
    let casts = getCasts();
    let endTime = new Date();
    let startTime = new Date();
    let startDate = startTime.getDate();
    startTime.setDate(startDate - 1);

    this.state = {
      selectedCast: selectedCast,
      casts: casts,
      points: [],
      startTime: startTime,
      endTime: endTime
    };
  }

  loadData() {
    let startTimeString = Moment(this.state.startTime).format('YYYYMMDDHHmmss');
    let endTimeString = Moment(this.state.endTime).format('YYYYMMDDHHmmss');

    let getData = getDataFromApi(this.state.selectedCast, startTimeString, endTimeString);
    console.log(getData);

    let newState = {
      points: parseMessage(getData)
    };

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
  
  render() {

    let data = {
      x: 'x',
      xFormat: '%Q',
      rows: this.state.points,
      type: 'spline'
    };

    let axis = {
      x: {
        type: 'timeseries',
        tick: {
          format: '%Y-%m-%d %H:%M:%S'
        }
      }
    };

    return (
      <div className="container-fluid">
        <p className="h1 text-center">CastBuddy Prototype UI</p>
        <hr />
        <div className="row align-items-center">
          <div className="col-3">
            <CastSelectMenu casts={this.state.casts} value={this.state.selectedCast} onChange={event => this.processCastChange(event)} />
          </div>
          <div className="col-1 text-right">Status:</div>
          <div className="col text-success">All Good</div>
        </div>
        <div className="row pt-3">
          <div className="col-3">
            <div className="card">
              <div className="card-header">
                <div className="row">
                  <div className="col-6 align-self-center">Sensors</div>
                  <div className="col-2"><button type="button" className="btn btn-outline-primary btn-sm">All</button></div>
                  <div className="col-4"><button type="button" className="btn btn-outline-secondary btn-sm">None</button></div>
                </div>
              </div>
              <div className="card-body">
              </div>
            </div>
          </div>
          <div className="col-9">
            <div className="row">
              <C3Chart data={data} axis={axis}/>
            </div>
            <div className="row align-items-center">
              <div className="col-1 text-right">From:</div>
              <div className="col"><DateTimePicker value={this.state.startTime} max={this.state.endTime} onChange={startTime => this.processStartTime(startTime)}/></div>
              <div className="col-1 text-right">To:</div>
              <div className="col"><DateTimePicker value={this.state.endTime} max={new Date()} min={this.state.startTime} onChange={endTime => this.processEndTime(endTime)} /></div>
              <div className="col-1"><button type="button" className="btn btn-outline-primary" onClick={() => this.loadData()}>Refresh</button></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;

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

function getCasts() {
  let casts = ['Cast1','FAUB_AR1'];
  return casts;
}

function getDefaultCast() {
  let casts = getCasts();
  return casts[casts.length-1];
}

function parseMessage(data) {
  let vals = [['x','s1','s2','s3','s4','s5','s6','s7','s8','s9','s10','s11','s12','s13','s14','s15','s16']];
  
  // assembling an array that looks like:
  //   [
  //     ['x',       's1', 's2', ...],
  //     [timestamp, val0, val1, ...],
  //     [timestamp, val0, val1, ...],
  //      .
  //      .
  //      .
  //   ]
  
  data.forEach(function(ct) {
    vals.push([ct.t].concat(ct.v));
  });
  
  return vals;
}

function getDataFromApi(cast, start, end) {
  let proxyUrl = 'https://cors-anywhere.herokuapp.com/';
  let targetUrl = `${getApiRoot}data/select?chip=${cast}&start=${start}&end=${end}`;
  let req = new XMLHttpRequest();

  req.open('GET', proxyUrl + targetUrl, false);
  req.send(null);
  return JSON.parse(req.responseText);
}
