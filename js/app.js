const Rx = require('rxjs/Rx');
const _  = require('lodash');

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

streams.humidityDay  = streams.humidity.bufferCount(pointsInDay);
streams.humidityWeek = streams.humidity.bufferCount(pointsInWeek);

streams.windDay  = streams.wind.bufferCount(pointsInDay);
streams.windWeek = streams.wind.bufferCount(pointsInWeek);
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
		colorize(currentTemp,value,tresholds.temperature);
	});

	let currentWind = document.getElementById('wind-current');
	streams.wind.subscribe((value)=>{
		currentWind.innerHTML = value;
		colorize(currentWind,value,tresholds.wind);
	});

	let currentHumidity = document.getElementById('humidity-current');
	streams.humidity.subscribe((value)=>{
		currentHumidity.innerHTML = value;
	});
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


	streams.temperatureDay
	.subscribe((values)=>{
		let min = _.min(values);
		let max = _.max(values);
		let avg = _.mean(values);

		dayMinTemp.innerHTML = min;
		dayMaxTemp.innerHTML = max;
		dayAvgTemp.innerHTML = avg;

		colorize(dayMinTemp,min,tresholds.temperature);
		colorize(dayMaxTemp,max,tresholds.temperature);
		colorize(dayAvgTemp,avg,tresholds.temperature);
	});


	streams.temperatureWeek
	.subscribe((values)=>{
		let min = _.min(values);
		let max = _.max(values);
		let avg = _.mean(values);

		weekMinTemp.innerHTML = min;
		weekMaxTemp.innerHTML = max;
		weekAvgTemp.innerHTML = avg;

		colorize(weekMinTemp,min,tresholds.temperature);
		colorize(weekMaxTemp,max,tresholds.temperature);
		colorize(weekAvgTemp,avg,tresholds.temperature);
	});


	streams.windDay
	.subscribe((values)=>{
		let min = _.min(values);
		let max = _.max(values);
		let avg = _.mean(values);

		dayMinWind.innerHTML = min;
		dayMaxWind.innerHTML = max;
		dayAvgWind.innerHTML = avg;

		colorize(dayMinWind,min,tresholds.wind);
		colorize(dayMaxWind,max,tresholds.wind);
		colorize(dayAvgWind,avg,tresholds.wind);
	});


	streams.windWeek
	.subscribe((values)=>{
		let min = _.min(values);
		let max = _.max(values);
		let avg = _.mean(values);

		weekMinWind.innerHTML = min;
		weekMaxWind.innerHTML = max;
		weekAvgWind.innerHTML = avg;

		colorize(weekMinWind,min,tresholds.wind);
		colorize(weekMaxWind,max,tresholds.wind);
		colorize(weekAvgWind,avg,tresholds.wind);
	});


	streams.humidityDay
	.subscribe((values)=>{
		let min = _.min(values);
		let max = _.max(values);
		let avg = _.mean(values);

		dayMinHumidity.innerHTML = min;
		dayMaxHumidity.innerHTML = max;
		dayAvgHumidity.innerHTML = avg;
	});


	streams.humidityWeek
	.subscribe((values)=>{
		let min = _.min(values);
		let max = _.max(values);
		let avg = _.mean(values);

		weekMinHumidity.innerHTML = min;
		weekMaxHumidity.innerHTML = max;
		weekAvgHumidity.innerHTML = avg;
	});

	//comfort || not comfort

	//считаем сколько раз дождь сегодня/в неделю/всего

	//ADVICES
	// < 0 || +10 с ветром  - шапку надень
	//rain - возьми зонт
	//<ADVICES


	//lava = the end is near
});
