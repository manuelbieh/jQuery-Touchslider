/*
* jQuery Touchslider Plugin
* @author: Manuel Bieh
* @url: http://www.manuelbieh.com/
* @version: 0.8 beta
* @license LGPL
*/
if(typeof jQuery != 'undefined') {

	jQuery(function($) {

		$.fn.extend({

			setValue: function(value) {

				return this.each(function () {

					var $$ = $(this),
						$params = $$.data('touchSlide');

					if($params != null) {

						if(value >= $params.options.minValue && value <= $params.options.maxValue) {
							$params.$btn.css($params.offsetSide, (value - $params.options.minValue) * $params.pixelsPerStep);
						}

					}

				});

			},

			touchSlide: function(options) {

				var settings = $.extend({}, $.fn.touchSlide.defaults, options);

				return this.each(function () {

					var	$$	= $(this),
						o	= $.metadata ? $.extend({}, settings, $$.metadata()) : settings;

					$$.addClass('touchSlide');

					var $btn			= $$.find(o.btnClass);
					var btnHalfX		= $btn.outerWidth()/2;
					var btnHalfY		= $btn.outerHeight()/2;
					var sliderWidth		= $$.innerWidth();
					var sliderHeight	= $$.innerHeight();

					if(o.btnHalf == true) {

						var sliderSize		= o.dir == 'v' ? sliderHeight : sliderWidth;

						if(o.dir == 'v') {
							$btn.css({
								marginTop: -(btnHalfY),
								marginBottom: -(btnHalfY)
							});
						} else {
							$btn.css({
								marginLeft: -(btnHalfX),
								marginRight: -(btnHalfX)
							});
						}
					} else {
						var sliderSize	= o.dir == 'v' ? sliderHeight-btnHalfY*2 : sliderWidth-btnHalfX*2;
					}

					if(o.inverse == true) {

						$btn.data('currentTop', 0); // Bottom
						$btn.data('currentLeft', 0); // Right

						if(o.dir == 'v') {
							$btn.css({
								bottom: 0
							});
						} else {
							$btn.css({
								right: 0
							});
						}

					} else {
						$btn.data('currentTop', 0);
						$btn.data('currentLeft', 0);
					}

					var getDistanceX = function(e) {
						if('ontouchstart' in window) {
							return e.originalEvent.touches[0].pageX;
						} else {
							return e.originalEvent.pageX;
						}
					}

					var getDistanceY = function(e) {
						if('ontouchstart' in window) {
							return e.originalEvent.touches[0].pageY;
						} else {
							return e.originalEvent.pageY;
						}
					}

					if(typeof o.initCallback == 'function') {
						o.initCallback({
							btn: $btn,
							slider: $$
						});
					}

					if(o.minValue || o.maxValue) {
						var steps = o.maxValue - o.minValue;
						var pixelsPerStep = sliderSize / steps;
					} else {
						var steps = sliderSize;
						var pixelsPerStep = 1;
					}

					var buttonSteps = sliderSize;
					var buttonPixelsPerStep = 1;

					if(o.dir == 'v') {
						var offsetSide = o.inverse == true ? 'bottom' : 'top';
					} else {
						var offsetSide = o.inverse == true ? 'right' : 'left';
					}

					if(o.initial) {
						var startPoint = parseInt((o.initial - o.minValue) * pixelsPerStep, 10);
						$btn.css(offsetSide, startPoint);
					}

					$btn.bind('mousedown touchstart', function(e) {

						e.preventDefault();
						$btn.data('startOffsetX', getDistanceX(e));
						$btn.data('startOffsetY', getDistanceY(e));

						if(o.inverse == true) {
							$btn.data('currentLeft', parseInt($btn.css('right'), 10)); // right
							$btn.data('currentTop', parseInt($btn.css('bottom'), 10)); // bottom
						} else {
							$btn.data('currentLeft', parseInt($btn.css('left'), 10));
							$btn.data('currentTop', parseInt($btn.css('top'), 10));
						}

					});

					var sliderInfo = {}

					$(document).bind('mousemove touchmove', function(e) {

						if(typeof $btn.data('startOffsetX') != 'undefined' && $btn.data('startOffsetX') != null) {

							e.preventDefault();

							if(o.dir == 'v') {

								var currentDistance = getDistanceY(e);
								var slideLength = -($btn.data('startOffsetY') - currentDistance);
								slideLength = o.inverse == true ? -slideLength : slideLength;
								var currentTop = parseInt($btn.data('currentTop'), 10);
								currentTop = isNaN(currentTop) ? 0 : currentTop;
								var newPos = currentTop + slideLength;

							} else {

								var currentDistance = getDistanceX(e);
								var slideLength = -($btn.data('startOffsetX') - currentDistance);
								slideLength = o.inverse == true ? -slideLength : slideLength;
								var currentLeft = parseInt($btn.data('currentLeft'), 10);
								var newPos = currentLeft + slideLength;

							}

							if( (slideLength > 0 && (newPos <= sliderSize)) || (slideLength < 0 && (newPos >= 0)) ) {

								$btn.css(offsetSide, newPos);

								if(slideLength%pixelsPerStep == 0) {
									//$btn.css(offsetSide, newPos);
								}

								var currentStep = newPos / pixelsPerStep;
								var value = parseInt(o.minValue + currentStep, 10);
								var percentage = Math.round(currentStep / steps * 100);

								var currentButtonStep = newPos / buttonPixelsPerStep;
								var buttonPercentage = currentButtonStep / sliderSize * 100;

								$$.data('value', value);
								$$.data('percentage', percentage);

								sliderInfo = {
									options: o,
									value: value || 0,
									buttonPercentage: buttonPercentage,
									percentage: percentage || 0,
									position: newPos,
									step: currentStep,
									btn: $btn,
									slider: $$,
									dir: o.dir,
									sliderSize: sliderSize,
									minValue: o.minValue,
									maxValue: o.maxValue,
								}


								if(!!o.stepCallback != false && typeof o.stepCallback[buttonPercentage] == 'function') {
									o.stepCallback[buttonPercentage](sliderInfo);
								}

								if(!!o.moveCallback != false && typeof o.moveCallback == 'function') {
									o.moveCallback(sliderInfo);
								}

							}

						}

					});

					var endDragging = function(e) {
						e.preventDefault();
						$btn.data('startOffsetX', null);
					}

					$(document).bind('mouseup touchend', function(e) {
						endDragging(e);
						if(!!o.endCallback != false && typeof o.endCallback == 'function') {
							o.endCallback(sliderInfo);
						}
					});

					$$.data('touchSlide', {
						'$btn': $btn,
						 options: o,
						 pixelsPerStep: pixelsPerStep,
						 btnHalfX: btnHalfX, 
						 btnHalfY: btnHalfY, 
						 sliderWidth: sliderWidth, 
						 sliderHeight: sliderHeight, 
						 sliderSize: sliderSize, 
						 offsetSide: offsetSide,
						 slideLength: typeof slideLength != 'undefined' ? slideLength : 0
					});

				});

			}

		});
		
		$.fn.touchSlide.defaults = {
			dir: 'h',
			btnHalf: true,
			minValue: 0,
			maxValue: 1,
			stepCallback: null,
			moveCallback: null,
			endCallback: null,
			btnClass: '.btn'
		};
		
	}(jQuery));

}