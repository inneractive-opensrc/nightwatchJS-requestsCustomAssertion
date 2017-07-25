var urlParser = require('url');

/**
 * Custom assertion for NightwatchJS, used to test if a browser request has been made 
 * and if it conforms to a specific URL and parameters protocol.  
 * Returns true if ANY request matches criteria.
 *
 * This is a major addition to: https://github.com/aedile/nightwatch-analytics
 * enabling custom URL parameters and performing a "Fuzzy" comparison that 
 * can include setting parameters as regular expressions.
 *
 * @param filter - A string to filter against URL requests for the page.
 * @param params - An object of parameters to match against the request.
 */
exports.assertion = function(filter, params) {
  /**
   * The message which will be used in the test output and
   * in XML reports
   * @type {string}
   */
  this.message = "Checking for request";

  /**
   * A value to perform the assertion on. If a function is defined, its result will be used.
   * @type {function|*}
   */
  this.expected = (function(){
    if(typeof params === 'undefined'){
      return "A request matching '" + filter + "' exists";
    }else{
      return "A request matching '" + filter + "' with params " + JSON.stringify(params) + " exists";
    }
  })();

  /**
   * Pass message handler.
   * @param result
   */
  this.pass = function(result) {
    console.log(result);
    return result != 'no matching records';
  };

  /**
  * Performs a regexp comparison on the values of the JSON request query string params
  * @param queryStringVal - the query string specific parameter's value
  * @param regexpValAsString - the regular expression to compare against (allows for wildcards)
  */
  var fuzzyCompare = function(queryStringVal, regexpValAsString) {
      var isFuzzyEqual = false;
      var queryStringValAsString = '' + queryStringVal;

      var regExp = new RegExp('^' + regexpValAsString);
      isFuzzyEqual = queryStringValAsString.match(regExp);

      // console.log('(Fuzzy) Comparing: ' + queryStringValAsString + ' with ' + regexpValAsString + " => Equals? : " + isFuzzyEqual);
      return isFuzzyEqual;
  }

  /**
  * Checks if obj1 and obj2 keys are similar
  * @param obj1 - JSON object
  * @param obj2 - JSON object
  * @returns {boolean} whether or not all keys are similar
  */
  var hasSameProperties = function(obj1, obj2) {
    for (key in obj1) {
      if (!obj2.hasOwnProperty(key)) {
        console.error("Missing key: " + key + " in predefined object.");
        return false;
      }
    }
    return true;
  }

  /**
  * Fuzzy comparing two JSON object keys, including / excluding values
  * @param firstObject - JSON object
  * @param secondObject - JSON object
  * @returns {boolean} whether or not all keys / keys + values are similar
  */
  var fuzzyCompareAllParams = function(firstObject, secondObject, checkOnlyKeys) {
    var passed = true;

    if (!firstObject || !secondObject || typeof firstObject !== 'object' || 
        typeof secondObject !== 'object' || !hasSameProperties(firstObject, secondObject)) {
      console.error("fuzzyCompareAllParams - objects are not equal");
      return false;
    }

    // Check that all params exist and match what's in the url.
    for (key in firstObject) {
      if (key in secondObject && !checkOnlyKeys) {
        // If they don't match, this is not our record, break out of loop.
        if (firstObject[key] != secondObject[key] && !fuzzyCompare(firstObject[key], secondObject[key])) {
          console.error("Parameter " + key + ": " + firstObject[key] + " is not equals or fuzzyequals to: " + secondObject[key] + "!");
          passed = false;
          break;
        } else {
          console.log("<" + key + "> " + firstObject[key] + " == " + secondObject[key]);
        }
      }
      else { // Param doesn't exist, this is not our record, break out of loop.
        console.error("Param: " + key + " does not appear. Exiting check...");
        passed = false;
        break;
      }
    }

    return passed;
  }

  /**
   * Process result of command and return a value to the pass function.
   * @param result The value returned from the command function.
   * @returns {string} the first matching record or 'no matching records'
   */
  this.value = function(result) {
    var records = result.value;

    // console.log('REQUESTS: ', result);
    for(var i=0; i < records.length; i++) {
      var urlObject = urlParser.parse(records[i].name, true);
      if(urlObject.href.indexOf(filter) >= 0) {
        console.log("Found a possible match of base URL: " + urlObject.host + urlObject.pathname + ". The complete URL to be checked is: " + urlObject.href + " - going over all of it's parameters...");

        // Fuzzy comparing objects 
        // (i.e., iterating over both and checking that they are completely identical, 
        // while enabling wildcards and regexps).
        if (fuzzyCompareAllParams(urlObject.query, params)) {
          console.log("Found a perfect (fuzzy) match!");
          return records[i].name;
        }
      }
    }

    //No record found
    return 'no matching records';
  };

  /**
   * Performs a protocol command/action and its result is
   * passed to the value method via the callback argument.
   * @type {function}
   */
  this.command = function(callback) {
    this.api.getRequests(callback);
    return this;
  };
};
