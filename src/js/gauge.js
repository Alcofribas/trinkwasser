(function(tw, d3) {
	'use strict';

	var GaugeGlass = function(svg) {
		var limit = 0;
		var nutrientLimits = {
			"natrium": 200,
			"kalium": 12,
			"calcium": 400,
			"magnesium": 60,
			"chlorid": 240,
			"nitrat": 60,
			"sulfat": 240
		};
		var yValueStop = 180, yValueMaxHeight = 642, yValueStart = yValueStop + yValueMaxHeight;

		/** lines */
		var linesToDisplay = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
		var calculateLineY = function(lineNumber) {
			var ratio = lineNumber / 20;
			var y = yValueStart - Math.round(yValueMaxHeight * ratio);
			return y;
		};
		var calculateLineX1 = function(lineNumber) {
			return lineNumber % 5 === 0 ? 38 : 47;
		};
		var renderLines = function() {
			var gaugeLines = svg.select('.gauge-lines').selectAll('line').data(linesToDisplay);
			var enter = gaugeLines.enter().append('line');
			enter.attr('x1', calculateLineX1).attr('x2', 55);
			enter.attr('y1', calculateLineY).attr('y2', calculateLineY);
		};

		/** nutrient labels */
		var labelsToDisplay = [];
		for ( var longLineNumber = 0; longLineNumber < 5; longLineNumber++) {
			labelsToDisplay.push(limit / 4 * longLineNumber);
		}
		var calculateLabelY = function(label) {
			var lineNumber = (label / (limit / 4)) * 5;
			return calculateLineY(lineNumber) + 6;
		};
		var updateLabels = function() {
			var gaugeLineLabels = svg.select('.gauge-lines').selectAll('text').data(labelsToDisplay);
			var enter = gaugeLineLabels.enter().append('text');
			enter.attr('x', 33).attr('y', calculateLabelY).attr('text-anchor', 'end');
			enter.text(function(label) {
				return label;
			});
		};
		this.applyNutrient = function(nutrient) {
			limit = nutrientLimits[nutrient];
			// updateLabels();
			return this;
		};

		/** value */
		var calculateBarY = function(value) {
			var ratio = value < 1 ? 0 : value / limit;
			var y = yValueStart - Math.round(ratio * yValueMaxHeight) - 1;
			return y;
		};
		var calculateBarHeight = function(value) {
			var height = yValueStart - calculateBarY(value);
			return height;
		};
		var updateBar = function(selector, y, height) {
			svg.select(selector).attr('y', function() {
				return y;
			}).attr('height', height);
		};
		var calculateBubbleBarBreakpoint = function(valueHeight) {
			return (valueHeight >= 123) ? 123 : 17;
		};
		var updateBars = function(value1, value2) {
			var value1Height = calculateBarHeight(value1);
			var startY = calculateBarY(0);
			var value2Diff = value2 > value1 ? value2 - value1 : 0;
			var bubbleBarBreakpoint = calculateBubbleBarBreakpoint(value1Height);

			if (bubbleBarBreakpoint > value1Height) {
				updateBar('.gauge-value-bubble-cut', startY, 0);
				updateBar('.gauge-value', startY, value1Height);
			} else {
				updateBar('.gauge-value-bubble-cut', startY - bubbleBarBreakpoint, bubbleBarBreakpoint);
				updateBar('.gauge-value', startY - value1Height, value1Height - bubbleBarBreakpoint + 1);
			}
			updateBar('.gauge-value-2', calculateBarY(value2), calculateBarHeight(value2Diff));
		};
		this.applyValue = function(value) {
			var value1 = value, value2 = 0;
			if (tw.utils.isRange(value)) {
				var minMax = tw.utils.getRange(value);
				value1 = minMax[0], value2 = minMax[1];
			}

			updateBars(value1, value2);
			return this;
		};

		/** display */
		this.show = function() {
			// ...
			return this;
		};
		this.hide = function() {
			// ...
			return this;
		};

		// renderLines();
	};

	var glassInstance = null;
	var barInstance = null;

	var update = function(attribute) {
		var values = tw.data.heilbronn.analysis[tw.data.heilbronn.streets['Allee']];
		var value = values[attribute];

		if (attribute !== 'hardness' && attribute !== 'price') {
			// barInstance.hide();
			glassInstance.show().applyNutrient(attribute).applyValue(value);
		} else {
			glassInstance.hide();
			barInstance.show().applyValue(value);
		}
	};

	var init = function() {
		glassInstance = new GaugeGlass(d3.select('.gauge-glass-img'));
		return this;
	};

	tw.gauge = {
		'init': init,
		'update': update
	};
})(tw, d3);