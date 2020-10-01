# Autocomplete component

Basic autocomplete function that listens to key events on a text input and fetches suggestions from a specified endpoint.


#Example usage

Import the JS and the SCSS files into your project.

#JS

```
import autoComplete from 'global-autocomplete';

const showResults = results => {
    // Update UI with results returned from server, e.g.

    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'c-results-container';

    data.forEach(datum => {
        const result = document.createElement('div');
        result.textContent = datum;
        result.tabIndex = "0";  // So you can focus/tab through the results
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
    timeout: 2000,          OPTIONAL: Set a timeout for the fetch request, onError will be called if fetch request timeouts, default is 2000
    minCars: 1,             OPTIONAL: Minimum characters to be typed before request is sent, default is 0
    inputDelay: 300,        OPTIONAL: Delay between keypress and request being sent, default is 300
    headers: {
      Accept: 'application/json; version=2'
    },
    resultsContainerSelector: 'c-results-container',
    resultSelector: 'c-results-container__result',
    resultsCallBack: showResults
};

const myAutoComplete = autoComplete(args);
myAutoComplete.enable();
```

#HTML
<input type="text" autocomplete="off" data-component-autocomplete>


#Notes
This component uses an ES7 feature, Object.values which will require a polyfill or shim for certain browsers if you are not transpiling your code.  --> https://github.com/es-shims/Object.values
