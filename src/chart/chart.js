//import C3Chart from 'react-c3js';
import c3 from 'c3';

var chart = c3.generate({
  bindto: '#vis',
  data: {
    x: 'x',
    rows: []
  }
});

function getFromFile(filename) {
  var x = new XMLHttpRequest();
  x.open('GET', filename, false);
  x.send(null);
  return JSON.parse(x.responseText);
}

function parseMessage(data) {
  var vals = [['x','s1','s2','s3','s4','s5','s6','s7','s8','s9','s10','s11','s12','s13','s14','s15','s16']];
  
  /* assembling an array that looks like:
    [
      ['x',       's1', 's2', ...],
      [timestamp, val0, val1, ...],
      [timestamp, val0, val1, ...],
       .
       .
       .
    ]
  */
  
  data.forEach(function(ct) {
    vals.push([ct.t].concat(ct.v));
  });
  
  return vals;
}

document.getElementById('btn_load').addEventListener('click', function() {
  var data = parseMessage(getFromFile('../dummy_data.json'));
  chart.load({
    rows: data,
    type: 'spline'
  });
});
