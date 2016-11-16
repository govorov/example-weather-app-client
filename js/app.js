const Rx = require('rxjs/Rx');
const _  = require('lodash');

const apiHost = 'https://example-weather-server.herokuapp.com';

const get = (parameter,callback)=>{
	fetch(`${apiHost}/${parameter}`)
	.then((response) => {
		return response.json()
	})
	.catch(e => console.error('SERVER API PROBLEM:',e))
	.then((raw)=>{callback(raw.result)});
};

const pointsInDay  = 4;
const pointsInWeek = pointsInDay*7;

let streams = {
	temperature : new Rx.Subject(),
	humidity    : new Rx.Subject(),
	wind        : new Rx.Subject(),
	precipation : new Rx.Subject(),
};


streams.temperature.subscribe((value)=>{
	// console.log('temperature received: ',value);
});

streams.humidity.subscribe((value)=>{
	// console.log('humidity received: ',value);
});

streams.wind.subscribe((value)=>{
	// console.log('wind received: ',value);
});

streams.precipation.subscribe((value)=>{
	// console.log('precipation received: ',value);
});

//stats streams
streams.temperatureDay  = streams.temperature.bufferCount(pointsInDay);
streams.temperatureWeek = streams.temperature.bufferCount(pointsInWeek);
//<stats streams

let appPaused = true;


let i1 = setInterval(function(){
	if (!appPaused){
		get('temperature',(value)=>{
			streams.temperature.next(value)
		});
	}
},1000);


let i2 = setInterval(function(){
	if (!appPaused){
		get('humidity',(value)=>{
			streams.humidity.next(value)
		});
	}
},1100);


let i3 = setInterval(function(){
	if (!appPaused){
		get('wind',(value)=>{
			streams.wind.next(value)
		});
	}
},900);


let i4 = setInterval(function(){
	if (!appPaused){
		get('precipation',(value)=>{
			streams.precipation.next(value)
		});
	}
},900);


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

//Q - how to refactor
streams.temperature.subscribe((value)=>{
	overallSeries.temperature.append(new Date().getTime(),value);
});

streams.humidity.subscribe((value)=>{
	overallSeries.humidity.append(new Date().getTime(),value);
});

streams.wind.subscribe((value)=>{
	overallSeries.wind.append(new Date().getTime(),value);
});


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
		clearInterval(i2);
		clearInterval(i3);
		clearInterval(i4);
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
	let currentTemp = document.getElementById('temp-current');
	streams.temperature.subscribe((value)=>{
		currentTemp.innerHTML = value;
	});

	let dayMinTemp  = document.getElementById('temp-day-min');
	let dayMaxTemp  = document.getElementById('temp-day-max');
	let dayAvgTemp  = document.getElementById('temp-day-avg');
	let weekMinTemp = document.getElementById('temp-week-min');
	let weekMaxTemp = document.getElementById('temp-week-max');
	let weekAvgTemp = document.getElementById('temp-week-avg');

	streams.temperatureDay
	.subscribe((values)=>{
		let min = _.min(values);
		let max = _.max(values);
		let avg = _.sum(values)/pointsInDay;

		dayMinTemp.innerHTML = min;
		dayMaxTemp.innerHTML = max;
		dayAvgTemp.innerHTML = avg;

	});

	//comfort || not comfort

	//считаем сколько раз дождь сегодня/в неделю/всего

	//ADVICES
	// < 0 || +10 с ветром  - шапку надень
	//rain - возьми зонт
	//<ADVICES


	//lava = the end is near
});
