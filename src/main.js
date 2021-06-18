import * as d3 from 'd3';
import {gauge, registry, metricDispatch} from './gauge.js';

import './gauges/clocks.js';
import './gauges/flight.js';
import './gauges/engine.js';

var metricDomains = {};

var ks = Object.keys(registry),
    svg = d3.select("body").append("svg")
        .attr("id", "flight-panel")
        .attr("width", 320*4)
        .attr("height", 320*Math.floor((ks.length+3)/4) + 40)
        .selectAll('.panel-gauge')
        .data(ks)
      .enter().append('g')
        .attr('class', k => 'panel-gauge panel-gauge-' + k)
        .attr('transform', (k, i) => 'translate(' + (2*(i%4)+1)*160 + ',' + (2*Math.floor(i/4)+1)*160 + ') scale(1.28)')
        .each(function(k) {
            const g = gauge(k);
            d3.select(this).call(g);
            if (g.metric()) {
                metricDomains[g.metric()] = g.measure().domain();
            }
        })
        .append('text').attr('y', 120).text(k => k);

metricDomains.altitude = metricDomains.altitude.map(v => v*20);

var metrics = Object.fromEntries(Object.entries(metricDomains).map(([k,v]) => [k, Math.random()*(v[1] - v[0])+v[0]]));

setInterval(() => {
    var dt = new Date(),
        msSinceMidnight = dt.getTime() - dt.setHours(0,0,0,0),
        t = Math.round(msSinceMidnight/1000);

    for (var k in metrics) {
        let d = metricDomains[k],
            v = (Math.random()-0.5)*(d[1]-d[0])*0.01;
        metrics[k] = Math.max(d[0], Math.min(d[1], metrics[k] + v));
    }
    metrics.time = t;
    metrics.date = new Date();
    metricDispatch.call('metric', null, metrics);
}, 100);

