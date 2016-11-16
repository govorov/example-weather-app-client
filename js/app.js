const Rx = require('rxjs/Rx');
// debugger

document.addEventListener("DOMContentLoaded", function(event) {
	// debugger
	const apiHost = 'http://localhost:3000';

	const get     = (parameter)=>{
		return fetch(`${apiHost}/${parameter}`,{
			mode:'no-cors',
		});
	};


});
