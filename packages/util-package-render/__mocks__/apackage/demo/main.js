import {autoComplete} from '../js/';

const showResults = results => {
	// Update UI with results returned from server, e.g.

	const resultsContainer = document.createElement('div');
	resultsContainer.className = 'c-results-container';

	results.forEach(datum => {
		const result = document.createElement('div');
		result.textContent = datum;
		result.tabIndex = '0'; // So you can focus/tab through the results
		result.className = 'c-results-container__result';
		resultsContainer.appendChild(result);
	});
	document.querySelector('[data-component-autocomplete]').insertAdjacentElement('afterend', resultsContainer);
};

const onSelect = result => {
	// Update UI with selected result
}

const onError = error => {
	// Update UI with error state
	// Optionally call myAutoComplete.disable();
}

const args = {
	selector: '[data-component-autocomplete]',
	onSelect: onSelect,
	searchError: onError,
	endPoint: 'autocomplete?q=',
	timeout: 2000,		// OPTIONAL: Set a timeout for the fetch request, onError will be called if fetch request timeouts, default is 2000
	minCars: 1,			// OPTIONAL: Minimum characters to be typed before request is sent, default is 0
	inputDelay: 300,	// OPTIONAL: Delay between keypress and request being sent, default is 300
	headers: {
		Accept: 'application/json; version=2'
	},
	resultsContainerSelector: 'c-results-container',
	resultSelector: 'c-results-container__result',
	resultsCallBack: showResults
};

const myAutoComplete = autoComplete(args);
myAutoComplete.enable();
