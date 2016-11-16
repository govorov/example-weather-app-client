const Rx = require('rxjs/Rx');
const _  = require('lodash');

//TODO
// const apiHost = 'https://example-weather-server.herokuapp.com';
const apiHost = 'http://localhost:3000';

const get = (parameter,callback)=>{
	fetch(`${apiHost}/${parameter}`)
	.then((response) => {
		return response.json()
	})
	.catch(e => console.error('SERVER API PROBLEM:',e))
	.then((raw)=>{callback(raw.result)});
};

const pointsInDay  = 4;
const pointsInWeek = pointsInDay*4;


const colorize = function(element,value,tresholds){
	let minColor = '#959ce8';
	let maxColor = '#c52222';
	let color;

	let [min, max] = tresholds;

	if (value < min){
		color = minColor;
	}
	else if (value > max){
		color = maxColor;
	}
	else {
		color = null;
	}

	element.style.color = color;
};


const tresholds = {
	temperature : [-10,30],
	wind        : [0,10],
};


let streams = {
	temperature : new Rx.Subject(),
	humidity    : new Rx.Subject(),
	wind        : new Rx.Subject(),
	precipation : new Rx.Subject(),
};


//stats streams
streams.temperatureDay  = streams.temperature.bufferCount(pointsInDay);

//TODO
//streams.temperatureWeek

//streams.humidityDay
//streams.humidityWeek

//streams.windDay
//streams.windWeek
//<stats streams

let appPaused = true;


let i1 = setInterval(function(){
	if (!appPaused){
		get('temperature',(value)=>{
			streams.temperature.next(value)
		});
	}
},1000);

//TODO
//get precipation, wind, humidity


//graphs
let overallGraphs = {
	temperature : new SmoothieChart(),
	humidity    : new SmoothieChart(),
	wind        : new SmoothieChart(),
};

let overallSeries = {
	temperature : new TimeSeries(),
	humidity    : new TimeSeries(),
	wind        : new TimeSeries(),
};

let seriesStyles = {
	temperature : {
		lineWidth:2,
		strokeStyle: 'rgb(255,204,102)',
	},
	humidity    : {
		lineWidth:2,
		strokeStyle: 'rgb(153,204,255)',
	},
	wind        : {
		lineWidth:2,
		strokeStyle: 'rgb(0,153,0)',
	},
};


Object.keys(overallSeries).forEach((key)=>{
	overallGraphs[key].addTimeSeries(overallSeries[key],seriesStyles[key]);
});


streams.temperature.subscribe((value)=>{
	overallSeries.temperature.append(new Date().getTime(),value);
});

//TODO
//streams.humidity
//streams.wind
//<graphs


document.addEventListener("DOMContentLoaded", function(event) {

	appPaused = false;

	document.getElementById('pause-app').onclick = function(){
		appPaused          = !appPaused;
		let icon           = this.firstChild;
		let newIconClass   = appPaused ? 'play' : 'pause';
		let iconColorClass = appPaused ? 'text-warning' : '';
		icon.className     = `fa fa-${newIconClass} ${iconColorClass}`;
	};

	document.getElementById('stop-app').onclick = function(){
		clearInterval(i1);
		//TODO - остальные интервалы
		this.firstChild.className = 'fa fa-stop text-danger';
	};

	//attach graphs
	let overallCanvasTemperature = document.getElementById('top-overall-temperature');
	let overallCanvasHumidity    = document.getElementById('top-overall-wind');
	let overallCanvasWind        = document.getElementById('top-overall-humidity');

	let overallCanvasContainer = document.getElementById('top-overall-container');
	let overallWidth 		   = overallCanvasContainer.offsetWidth;

	overallCanvasTemperature.setAttribute('width',overallWidth);
	overallCanvasHumidity.setAttribute('width',overallWidth);
	overallCanvasWind.setAttribute('width',overallWidth);

	overallGraphs.temperature.streamTo(overallCanvasTemperature);
	overallGraphs.humidity.streamTo(overallCanvasHumidity);
	overallGraphs.wind.streamTo(overallCanvasWind);
	//<graps

	//watch
	//TODO
	//<watch

	//Q - how to refactor
	let dayMinTemp      = document.getElementById('temp-day-min');
	let dayMaxTemp      = document.getElementById('temp-day-max');
	let dayAvgTemp      = document.getElementById('temp-day-avg');
	let weekMinTemp     = document.getElementById('temp-week-min');
	let weekMaxTemp     = document.getElementById('temp-week-max');
	let weekAvgTemp     = document.getElementById('temp-week-avg');

	let dayMinHumidity  = document.getElementById('humidity-day-min');
	let dayMaxHumidity  = document.getElementById('humidity-day-max');
	let dayAvgHumidity  = document.getElementById('humidity-day-avg');
	let weekMinHumidity = document.getElementById('humidity-week-min');
	let weekMaxHumidity = document.getElementById('humidity-week-max');
	let weekAvgHumidity = document.getElementById('humidity-week-avg');

	let dayMinWind      = document.getElementById('wind-day-min');
	let dayMaxWind      = document.getElementById('wind-day-max');
	let dayAvgWind      = document.getElementById('wind-day-avg');
	let weekMinWind     = document.getElementById('wind-week-min');
	let weekMaxWind     = document.getElementById('wind-week-max');
	let weekAvgWind     = document.getElementById('wind-week-avg');

	//TODO - table

	//comfort || not comfort

	//считаем сколько раз дождь сегодня/в неделю/всего

	//ADVICES
	// < 0 || +10 с ветром  - шапку надень
	//rain - возьми зонт
	//<ADVICES


	//lava = the end is near
	//rain + min temp - ледяной дождь
	//...
});
