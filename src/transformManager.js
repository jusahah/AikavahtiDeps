var _ = require('lodash');
var logging = require('./dev/logging');
var Promise = require('bluebird');

var transformBridge = require('./transformDeps/bridge');
// Creation time state (inited once)

function initNameObject(listOfTransforms) {
	var o = {};
	_.each(listOfTransforms, function(transform) {
		if (!transform.hasOwnProperty('name')) {
			logging.error('Transform not registered: Name missing in transformation object!');
			// Just dump this, maybe its not referenced anywhere...?
			// Hmm. Maybe logger could throw if we decide so. No. Thats too hacky.
		} else {
			o[transform.name] = transform;
		}
	});

	return o;
}




module.exports = function(listOfTransforms, allDataFromDB) {

	// Initialization provides list of all transforms system uses
	// Some transform come from codebase, some from evaluation of later added module files!
	// They all are naturally handled the same here

	// Init data structures
	var allData = allDataFromDB; // Event data, settings, etc. Everything man can hope for.
	var transformsList = listOfTransforms; // Just for clarity make this initialization explicit
	var transformsByName = initNameObject(listOfTransforms); // Init hashtable to transformer lookups

	// Runtime state
	var transformsReady = {}; //empty for now, to be filled as computation are performed. Will keep result sets in memory.

	// Return public API
	return {
		/*
		// Not in use
		runOne: function(name, additionalArgsObject) {
			if (!allData) {
				// We have not yet received (currently implementation gets data right away so this check is obsolete...)
				logging.error('Trying to run transformation too early - allData not yet here!');
				return null;
			}
			if (!transformsByName.hasOwnProperty(name)) {
				logging.error('Running single transform fails - name not found: ' + name);
				return null;
			}

			if (transformsReady.hasOwnProperty(name)) {
				// Already computed as should be when calling for one
				return Promise.resolve(transformsReady[name]);
			} else {
				return new Promise(function(resolve, reject) {
					var separateThreadPromise = calcTransformation(name, additionalArgsObject);
					separateThreadPromise.then(function(resultsObject) {
						resolve(resultsObject);
					}).catch(function(e) {
						logging.error('runOne transformation thread promise threw error!');
						logging.error(e);
						reject(e);
					});
				});
			}
		}
		*/

		// Return Promise
		runAll: function(cbToSendResultsTo) {
			transformBridge(transformsList, allData, cbToSendResultsTo);
		}

	}

	


}


/* 
Single transform layout

@name         (required) = name string by which clients and other transforms can call this
@prerequisite (required) = transform which results are piped to this one (null if straight from DB)
@transform    (required) = the actual transform function, takes in copy of data and args that are injected by client
@priority     (optional) = 1 -> 3 (lowest -> highest). Order of transforms execution. Default is 1.

{
	name: name_of_transform,
	prerequisite: some_other_transform / null,
	transform: function(data, additionalArgsObject) {...},
	priority: 1 / 2 / 3
}
*/