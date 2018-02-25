import React, { Component } from 'react';
import './App.css';
import dummy_data from './chart/dummy_data.json';
//import c3 from 'c3';
import C3Chart from 'react-c3js';
//import {LineChart} from 'react-easy-chart';
import Moment from 'moment';
import momentLocalizer from 'react-widgets-moment';
import simpleNumberLocalizer from 'react-widgets-simple-number';
import DateTimePicker from 'react-widgets/lib/DateTimePicker';

Moment.locale('en');
momentLocalizer();
simpleNumberLocalizer();

class App extends Component {
  constructor(props) {
    super(props);

    var endTime = new Date();
    var startTime = new Date();
    var startDate = startTime.getDate();
    startTime.setDate(startDate - 1);

    this.state = {
      points: [],
      startTime: startTime,
      endTime: endTime
    };
  }

  loadData() {
    var newState = {
      points: parseMessage(dummy_data)
      // points: parseForEasyChart(dummy_data)
    };

    this.setState(newState);
  }

  processStartTime(value) {
    var newState = {
      startTime: value
    };

    this.setState(newState);
  }

  processEndTime(value) {
    var newState = {
      endTime: value
    };

    this.setState(newState);
  }
  
  render() {

    var data = {
      x: 'x',
      xFormat: '%Q',
      rows: this.state.points,
      type: 'spline'
    };

    var axis = {
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
            <select className="form-control">
              <option>Cast 1</option>
            </select>
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
              {/*
              <LineChart
                axes
                grid
                verticalGrid
                dataPoints
                xType={'time'}
                datePattern={'%Q'}
                interpolate={'cardinal'}
                lineColors={['pink','magenta','red','orange','green','cyan','blue','indigo','violet','purple']}
                width={700}
                height={400}
                data={this.state.points}
              />
              */}
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

function parseMessage(data) {
  var vals = [['x','s1','s2','s3','s4','s5','s6','s7','s8','s9','s10','s11','s12','s13','s14','s15','s16']];
  
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

/*
function parseForEasyChart(data) {
  var vals = [];
  var num_sensors = 16;
  var num_times = 4;

  // construct array of 16 blank arrays
  for (var i = 0; i<num_sensors; i++) {
    vals.push([]);
  }

  // assembling an array that looks like:
  //   [
  //     [
  //       { x: ts_0, y: s0_0 },
  //       { x: ts_1, y: s0_1 },
  //       .
  //       .
  //       .
  //     ],
  //     [
  //       { x: ts_0, y: s1_0 },
  //       { x: ts_1, y: s1_1 },
  //       .
  //       .
  //       .
  //     ],
  //     .
  //     .
  //     .
  //   ]

  for(var t=0; t<num_times; t++) {
    for(i=0; i<num_sensors; i++) {
      vals[i].push({x: data[t].t, y: data[t].v[i]});    // ct.v.length = vals.length
    }
  }

  return vals;
}
*/
