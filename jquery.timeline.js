/*
 * Jquery timeline : jQuery plugin allowing you to transform a list of elements into a two columns timeline
 * Copyright 2013 Loïc B. Florin (@bf_loic)
 * Licensed under the MIT license.
 * Version 1.0
 */

(function($) {

	/*
	 * throttledresize: special jQuery event that happens at a reduced rate compared to "resize"
	 *
	 * latest version and complete README available on Github:
	 * https://github.com/louisremi/jquery-smartresize
	 *
	 * Copyright 2012 @louis_remi
	 * Licensed under the MIT license.
	 */
	var $event = $.event,
		$special,
		dummy = {_:0},
		frame = 0,
		wasResized, animRunning;

	$special = $event.special.throttledresize = {
		setup: function() {
			$( this ).on( "resize", $special.handler );
		},
		teardown: function() {
			$( this ).off( "resize", $special.handler );
		},
		handler: function( event, execAsap ) {
			// Save the context
			var context = this,
				args = arguments;

			wasResized = true;

			if ( !animRunning ) {
				setInterval(function(){
					frame++;

					if ( frame > $special.threshold && wasResized || execAsap ) {
						// set correct event type
						event.type = "throttledresize";
						$event.dispatch.apply( context, args );
						wasResized = false;
						frame = 0;
					}
					if ( frame > 9 ) {
						$(dummy).stop();
						animRunning = false;
						frame = 0;
					}
				}, 30);
				animRunning = true;
			}
		},
		threshold: 0
	};
	
	/*
	 * Now, jQuery.timeline
	 */
    $.timeline = function(element, options) {

        var defaults = {
            'item': 			'.block',
			'corner': 			false,
			'wide': 			false,
			'line':				false,
			'arrows':			false,
			'deletebtn':		false,
			'column': 			2,
			'first': 			'right',
			'animation': 		false,
			'duration': 		2000,
			'onComplete':		false,
			'onRemoveItem':		false
        }

        var plugin = this;

        plugin.settings = {}

        var $element = $(element),
             element = element;

		/**
		 * Initialize
		 * First initalization with callback
		 */
		plugin.initialize = function() {
			plugin.settings = $.extend({}, defaults, options);
			if(typeof(plugin.settings.onComplete) == 'function') plugin.settings.onComplete($element);
			
			if(plugin.settings.animation) {
				if($.inArray(plugin.settings.animation, ['fade', 'slide']) == -1) {
					plugin.settings.animation = 'show';
					plugin.settings.duration = 1;
				} else plugin.settings.animation+='Toggle';
			} else {
				plugin.settings.animation = 'show';
				plugin.settings.duration = 1;
			}
			
			plugin.init();
		}
		
		/**
		 * Init
		 * Initialize plugin and apply styling
		 */
        plugin.init = function() {
			// Listener on window resize
			$(window).on('throttledresize', function() {
				plugin.position($(this));
			});
			$element.addClass('timeline-container');
			$element.find(plugin.settings.item).each(function() {
				$(this).wrap('<div class="timeline-item" />');
			});
			
			if(plugin.settings.line != false) {
				$element.prepend('<div class="timeline-central-line" />');
			}
			if(plugin.settings.wide != false) {
				$element.find(plugin.settings.wide).parent().addClass('timeline-wide-item');
			}
			if(plugin.settings.corner != false) {
				$corner = $element.find(plugin.settings.corner);
				$element.find(plugin.settings.item).each(function() {
					var index = $element.find(plugin.settings.item).index(this);
					$(this).attr('data-timeline-initial-position', index);
				});
				$element.find(plugin.settings.corner).unwrap().remove();
				if(plugin.settings.first == 'left') {
					$($element.children('.timeline-item').get(0)).after($corner);
				}
				else $element.prepend($corner);
				$corner.wrapAll('<div class="timeline-item timeline-corner-item" />');
			}
			if(plugin.settings.arrows) {
				$element.find('.timeline-item:not(.timeline-wide-item)').find(plugin.settings.item).each(function() {
					$(this).prepend('<span class="timeline-item-arrow" />');
				});
			}
			if(plugin.settings.deletebtn) {
				$element.find('.timeline-item').find(plugin.settings.item).each(function() {
					$(this).prepend('<span class="timeline-item-close '+plugin.settings.deletebtn+'" />');
				});
				
				$('.timeline-item-close').on('click', function() {
					if(typeof(plugin.settings.onRemoveItem) === 'function')
						plugin.removeItem({element:$(this), callback:plugin.settings.onRemoveItem});
					else plugin.removeItem($(this));
				});
			}
			
			plugin.position();
        }

		/**
		 * Reload
		 * Reapply styling for the current set of elements
		 */
		plugin.reload = function() {
			plugin.remove();
			plugin.init();
		}
		
		/**
		 * Position
		 * Place elements in the adequat column
		 */
        plugin.position = function() {
            var left = 0,
			right = 0;
			if(typeof(plugin.settings.column) == 'function') {
				column = plugin.settings.column(element);
			} else column = plugin.settings.column;
			if(column == 1) $element.addClass('timeline-wide-format');
			else $element.removeClass('timeline-wide-format');
			$element.find('.timeline-item').each(function() {
				if($(this).hasClass('timeline-wide-item') || (column == 1)) {
					$(this).removeClass('timeline-position-left timeline-position-right').addClass('timeline-position-left');
					left += $(this).height();
					right = left;
				}
				else {
					if(left > right || $(this).hasClass('timeline-corner-item')) {
						$(this).removeClass('timeline-position-left timeline-position-right').addClass('timeline-position-right');
						right += $(this).height();
					}
					else {
						$(this).removeClass('timeline-position-left timeline-position-right').addClass('timeline-position-left');
						left += $(this).height();
					}
				}
			});
        }
		
		/**
		 * Prepend
		 * Prepend the given new element and throw a callback
		 */
		plugin.prepend = function(args) {
			if(typeof(args) == 'undefined') {
				window.console.error('cannot prepend undefined element');
				return 0;
			}
			// ! Must allow anonymous arguments
			if(typeof(args.element) != 'undefined') {
				var callback = args.callback;
				args = args.element;
			}
			plugin.remove();
			var newitem = $(args).prependTo($element).hide()[plugin.settings.animation](plugin.settings.duration, function() {
				if(plugin.settings.duration) plugin.reload();
				if(callback) callback(newitem);
			});
			plugin.init();
		}
		
		/**
		 * Append
		 * Append the given new element and throw a callback
		 */
		plugin.append = function(args) {
			if(typeof(args) == 'undefined') {
				window.console.error('cannot append undefined element');
				return 0;
			}
			// ! Must allows anonymous arguments
			if(typeof(args.element) != 'undefined') {
				var callback = args.callback;
				args = args.element;
			}
			plugin.remove();
			var newitem = $(args).appendTo($element).hide()[plugin.settings.animation](plugin.settings.duration, function() {
				if(plugin.settings.duration) plugin.reload();
				if(callback) callback(newitem);
			});
			plugin.init();
		}
		
		/**
		 * RemoveItem
		 * Remove the given new element and throw a callback
		 */
		plugin.removeItem = function(args) {
			if(typeof(args) == 'undefined') {
				window.console.error('cannot remove undefined element');
				return 0;
			}
			// ! Must allow anonymous arguments
			if(typeof(args.element) != 'undefined') {
				var callback = args.callback;
				var elm = args.element;
			} else var elm = args;
			
			var item = $(elm).is('.timeline-item')?$(elm):$(elm).closest('.timeline-item');
			
			if(item.is('.timeline-corner-item')) elm = $(elm).closest(plugin.settings.item);
			else elm = item;
			
			// Copy of element for callback return
			var clbElm = elm.is(plugin.settings.item)?elm:elm.find(plugin.settings.item);
			
			var removed = $element.find(elm).index();
			$element.find(plugin.settings.corner).each(function() {
				var index = $(this).attr('data-timeline-initial-position');
				if(index > removed) $(this).attr('data-timeline-initial-position', parseInt(index)-1);
			});
			
			elm[plugin.settings.animation](plugin.settings.duration, function() {
				elm.remove();
				if(plugin.settings.duration) plugin.reload();
				if(callback) callback(clbElm);
			});
		}
		
		/**
		 * Destroy
		 * Remove all listeners and styles applied then destroy the instance of timeline
		 */
		plugin.destroy = function(args) {
			plugin.remove();
			if(typeof(args) == 'function') args($element);
			$element.removeData('timeline');
		}
		
		/**
		 * Remove
		 * Remove all listeners and styles applied but keep the options set
		 */
		plugin.remove = function() {
			// Reposition corner items to their origin
			if(plugin.settings.corner != false) {
				var $corners = $element.find(plugin.settings.corner);
				$element.find('.timeline-corner-item '+plugin.settings.corner).remove();
				$element.find('.timeline-corner-item').remove();
				$element.find('.timeline-item '+plugin.settings.item).unwrap();
				var last = $element.find(plugin.settings.item+':last').index();
				$corners.each(function() {
					var index = $(this).attr('data-timeline-initial-position');

					if(index == 0) $(this).insertBefore($element.find(plugin.settings.item).get(parseInt(index))).removeAttr('data-timeline-initial-position');
					else $(this).insertAfter($element.find(plugin.settings.item).get(parseInt(index)-1)).removeAttr('data-timeline-initial-position');
				});
			} else $element.find('.timeline-item '+plugin.settings.item).unwrap();
			// Remove extra options
			if(plugin.settings.line != false) {
				$element.find('.timeline-central-line').remove();
			}
			if(plugin.settings.arrows) {
				$element.find(plugin.settings.item).each(function() {
					$element.find(plugin.settings.item+' .timeline-item-arrow').remove();
				});
			}
			if(plugin.settings.deletebtn) {
				$element.find(plugin.settings.item).each(function() {
					$element.find(plugin.settings.item+' .timeline-item-close').remove();
				});
			}
			$element.removeClass('timeline-container');

			// Disable listener on resize
			$(window).off('throttledresize');
		}
		
		jQuery.expr[':'].parents = function(a,i,m){
			return jQuery(a).parents(m[3]).length < 1;
		};
		
		
        plugin.initialize();

    }

    $.fn.timeline = function(options) {
		if ( typeof options === 'string' ) {
			// call method
			var args = Array.prototype.slice.call( arguments, 1 );

			this.each(function() {
				var instance = $.data( this, 'timeline' );
				if ( !instance ) {
					window.console.error( "cannot call methods on timeline prior to initialization; " +
										  "attempted to call method '" + options + "'" );
				return;
			}
			if ( !$.isFunction( instance[options] ) || options.charAt(0) === "_" ) {
				window.console.error( "no such method '" + options + "' for timeline instance" );
				return;
			}
			// apply method
			instance[ options ].apply( instance, args );
			});
		}
		else {
			return this.each(function() {

				// New instance
				if (undefined == $(this).data('timeline')) {
					var plugin = new $.timeline(this, options);
					$(this).data('timeline', plugin);
				}
				// Replace instance
				else {
					$(this).data('timeline').destroy();
					var plugin = new $.timeline(this, options);
					$(this).data('timeline', plugin);
					//return;
				}
			});
		}
    }

})(jQuery);