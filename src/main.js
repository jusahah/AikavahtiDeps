var jQuery = require('jquery');
var tinycolor = require('tinycolor2');
var colorAssigner = require('./colorassigner');

//Transformer deps
var transformManager = require('./transformManager');
/*
var coloredTree = colorAssigner([

	{
		name: 1,
		color: 'yellow',
	},
	{
		name: 2,
		color: 'yellow',
		children: [
			{
				name: '2_1',
				color: 'red',
			}, {
				name: '2_2',
				color: 'red',
			},
			{
				name: '2_3',
				color: 'red',
			}

		]
	},
	{
		name: 3,
		color: 'yellow',
		children: [
			{
				name: '3_1',
				color: 'orange',
			}
		]
	}


], {
	baseColor: '#77ff22'
}); 
*/

var coloredTree = colorAssigner([

	{
		name: 1,
		children: [
					{
						name: '1_1',
					}, {
						name: '1_2',
					}, {
						name: '1_3',
					}, {
						name: '1_4',
					},					
		]
	},
	{
		name: 2,

		children: [
			{
				name: '2_1',
			}, {
				name: '2_2',
			},
			{
				name: '2_3',
				children: [
					{
						name: '2_3_1',
					}, {
						name: '2_3_2',
					}, {
						name: '2_3_3',
					}, {
						name: '2_3_4',
					},					
				]
			}

		]
	},
	{
		name: 3,

		children: [
			{
				name: '3_1',
		
			},
						{
				name: '3_1',
		
			},
						{
				name: '3_1',
		
			},
						{
				name: '3_1',
		
			}
		]
	},
	{
		name: 4,

		children: [
			{
				name: '4_1',
			}, {
				name: '4_2',
			},
			{
				name: '4_3',
				children: [
					{
						name: '4_3_1',
					}, {
						name: '4_3_2',
					}, {
						name: '4_3_3',
					}, {
						name: '4_3_4',
					},					
				]
			},
			{
				name: '4_4',
				children: [
					{
						name: '4_4_1',
					}, {
						name: '4_4_2',
						children: [
							{
								name: '4_4_2_1',
							}, {
								name: '4_4_2_2',
							}	
						]						
					}					
				]
			},			

		]
	},	


], {
	//baseColor: tinycolor.random().saturate(40).toString(),
	colorRangeFromBase: 260
});

console.log("COLORED TREE BELOW");
console.log(JSON.stringify(coloredTree));

colorVisualize(coloredTree);


function colorVisualize(coloredTree) {

	var treeArea = jQuery('#treearea');
	treeArea.empty().append(buildHTMLFromTree(coloredTree));

}

function buildHTMLFromTree(coloredTree) {
	var baseMargin = 0;
	var html = '';
	var depth = 1;

	html = buildSubtree(coloredTree, depth);

	return html;


}

function buildSubtree(coloredTree, depth) {

	var subHTML = '';

	if (coloredTree && coloredTree.length !== 0) {
		_.each(coloredTree, function(branch) {
			console.log("BRANCH: " + branch.name + " with depth " + depth);
			subHTML += createOneElement(branch.name, branch.color, depth);
			if (branch.hasOwnProperty('children')) {
				subHTML += buildSubtree(branch.children, depth+1);
			}
			
		});

	};

	return subHTML;
}

function createOneElement(name, color, depth) {
	return "<div style='background-color: " + color + "; margin-left: " + (depth * 20) + "px';>" + name + "</div>";
}







/// Transformer part

// Building up manager
var transformRunner = transformManager([
{
	name: 'sumUp',
	prerequisite: 'minus3ToAll',
	transform: function(data) {
		return _.reduce(data, function(sum, num) {
			return sum + num;
		}, 0);
	}

},
{
	name: 'plus2ToAll',
	prerequisite: 'minus3ToAll',
	transform: function(data) {
		return _.map(data, function(num) {
			return num + 2;
		})
	}

},
{
	name: 'minus3ToAll',
	prerequisite: 'minus6ToAll',
	transform: function(data) {
		return _.map(data, function(num) {
			return num-3;
		});
	}

}
,
{
	name: 'minus4ToAll',
	prerequisite: null,
	transform: function(data) {
		return _.map(data, function(num) {
			return num-4;
		});
	}

}
,
{
	name: 'minus6ToAll',
	prerequisite: 'minus7ToAll',
	transform: function(data) {
		return _.map(data, function(num) {
			return num-6;
		});
	}

}
,
{
	name: 'minus7ToAll',
	prerequisite: null,
	transform: function(data) {
		return _.map(data, function(num) {
			return num-7;
		});
	}

}

]);

// Calling runAll with cb
console.log("CALLING Runner");
transformRunner.runAll(function(name, results) {
	console.warn("-------RESULT BACK---------");
	console.log(name);
	console.log(results);
	console.warn("---------------------------");
}, [1,1,1,1,1,1]);



