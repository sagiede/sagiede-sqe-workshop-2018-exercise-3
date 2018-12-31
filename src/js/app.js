import $ from 'jquery';
import {createFlowChart} from './code-analyzer';
var flowchart = require('flowchart.js');

const flowchartConfig={
    'x': 0,
    'y': 0,
    'line-width': 2,
    'line-length': 50,
    'text-margin': 12,
    'font-size': 14,
    'font-color': 'black',
    'line-color': 'black',
    'element-color': 'black',
    'fill': 'white',
    'yes-text': 'T',
    'no-text': 'F',
    'arrow-end': 'block',
    'scale': 1,
    'symbols': {
        'start': {
            'font-color': 'red',
            'element-color': 'green',
        },
        'end':{
            'class': 'end-element'
        }
    },
    'flowstate' : {
        'isGreen': {'fill': '#06b030', 'font-size': 14}
    }
};

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let userParams = $('#varsPlaceholder').val();
        let flowChartDiagramString = createFlowChart(codeToParse,userParams);
        const flowChartDiagram = flowchart.parse(flowChartDiagramString);
        flowChartDiagram.drawSVG('output', flowchartConfig);
    });
});

