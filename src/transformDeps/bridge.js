var _ = require('lodash');
var logging = require('../dev/logging');

// Note that this module must have knowledge of transportation system
// It takes care of actually sending data and transforms to another process (or to server)

var msgIDCounter = 1; //Static counter for app lifecycle

var cbsBack = {};

function sendAway(transformsList, data, batchID) {

	// For now we simulate by calling setTimeout
	setTimeout(function() {
		fakeCalcAll(transformsList, data, batchID);
	}, 50 + Math.floor(Math.random()*400));

}

function receiveResult(name, results, batchID) {
	if (cbsBack.hasOwnProperty(batchID)) {
		logging.dev("PIPING RESULTS BACK TO RESULTS CB");
		cbsBack[batchID](name, results);
	}
}

function registerAsListeningFor(batchID, cbToPipeResults) {
	cbsBack[batchID] = cbToPipeResults;
}

module.exports = function(transformsList, data, cbToPipeResults) {

	var batchID = Date.now() + "_" + msgIDCounter++;
	// Send to another process
	sendAway(transformsList, data, batchID);
	registerAsListeningFor(batchID, cbToPipeResults);
	setTimeout(function() {
		if (cbsBack.hasOwnProperty(batchID)) {
			cbsBack[batchID] = null;
			delete cbsBack[batchID];
		}
	}, 30 * 1000); // Make sure batch ID is sometime deleted so callback frame can be GCd



}



// This is fake
function fakeCalcAll(transformsList, data, batchID) {

	var cachedResults = {}; // name -> results hashtable
	console.log("Fake calc all");
	function calcOne(transformSelected) {

		var next;
		if (transformsList.length !== 0) {
			transformSelected = transformSelected || transformsList[0];
			if (!transformSelected.prerequisite || cachedResults.hasOwnProperty(transformSelected.prerequisite)) {
				// The dep for this one has been fulfilled -> just calc
				next = transformsList.shift();
				// Fake apply here
				// next.transform(data);
				console.log("RUNNING TRANSFORM: " + next.name);
				var toBeSentData = transformSelected.prerequisite ? cachedResults[transformSelected.prerequisite] : data;
				var results = next.transform(toBeSentData);
				cachedResults[next.name] = results;
				receiveResult(next.name, results, batchID);
				setTimeout(calcOne, 250);
			} else {
				// Move the first element to last and try again
				next = transformsList.shift();
				transformsList.push(next); // Length does not change
				setTimeout(calcOne, 250);
			}			

		}
	}

	calcOne(); // Start the timeout loop

}