# NightwatchJS - Requests Custom Assertion

A custom NightwatchJS assertion that enables validating outgoing browser HTTP requests, 
while also enabling wildcards and regular expressions. Very useful for large scale web automated E2E tests on desktop.

 Usage:

1. Validate NightwatchJS's custom assertions directory location inside the nightwatch.json configuration file 
(e.g., "custom_assertions_path" : ["tests/e2e/helpers/assertions"]).

2. Place custom assertion file inside the custom assertions directory.

3. Use in nightwatchJS tests like so: 

'test' : function (browser) {
    var requestParameters = {
      "param1" : "value1",
      "param2" : "value2", // etc.
    };

    browser.assert.hasRequest('http://some.request.url?param1=value1&param2=value2', requestParameters);
},
  
4. Can also replace parameter values (e.g., value1 and value2 above) with regular expressions 
in order to enable wildcards such as "*", etc.
