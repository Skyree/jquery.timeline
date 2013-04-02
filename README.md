jquery.timeline
===============

jQuery.timeline is a jQuery plugin allowing you to transform a container with similar elements in a 2 columns timeline.

## Version
1.0

## Installation
* Include `jquery.timeline.js` in your scripts after jquery.
* Include `timeline.css` in your head tag.

## Properties
Enable the plugin on your selector by using the method :
`$('#selector').timeline()`


### item
`item` must be a selector for your timeline items. By default it is set to `.block`.

### corner
`corner` must be a selector to define what elements will be in the top right corner. If set to `false` corner option won't be enabled. By default it is set to `false`.

### wide
`wide` must be a selector to define what elements must always fill the two columns width. If set to `false` wide option won't be enabled. By default it is set to `false`.

### line
`line` is a boolean allowing you to add a central line in the timeline that you can design with your own css. By default it is set to `false`.

### arrows
`arrows` is a boolean allowing you to add arrows on the sides of your timeline items that you can design with your own css. By default it is set to `false`.

### deletebtn
`deletebtn` allows you to add delete buttons on your timeline items. You can set a specific class like `.remove-me` or just set it to `true`. By default it is set to `false`.
If this option is enabled, a listener of these buttons will call a function to remove the related timeline items. You can set a callback automatically with the property `onRemoveItem`.

### column
`column` defines a number of column (1 or 2). It must be a integer or a function returning an integer. By default it is set to `2`.
By using it as a function, you can retrieve your timeline container :

	$('#selector').timeline({
		column: function(container) {
			if($(container).width() > 768) return 1;
			else return 2;
		}
	});

This example return one column if your container is narrower than 768 pixels, 2 columns on the contrary.

### first
`first` must be set to `left` or `right`. This property works with the `corner` property. Setting it to right makes the corner item first in the DOM, setting it to the left makes it second.
That allows you to choose the order in a single column display. By default it is set to `right`.

### animation
`animation` allows you to use an effect when you append, prepend or remove an element from the timeline. It can be set to :
* `fade`
* `slide`

By default it is set to `false` so you don't have animation.

### duration
`duration` must be an integer. Use it to choose the duration of the animation in milliseconds. By default it is set to `2000`.

### onComplete
`onComplete` is a callback called when the timeline is built. By default it is set to `false`.

### onRemoveItem
`onRemoveItem` is a callback called when you click on a delete button built with the `deletebtn` property. By default it is set to `false`.

## Methods

### reload
Reload the timeline to reposition elements.
`$('#selector').timeline('reload')`

### prepend
Prepend an element and allows a callback.

Options :
* element : An element that suits the item property.
* callback : An optional callback function.

If you don't need a callback you don't need to use a map.
* `$('#selector').timeline('prepend', '<div class="block" />')`
* `$('#selector').timeline('prepend', {element: '<div class="block" />', callback: function(newElm) { // do stuff }})`

### append
Append an element and allows a callback.

See prepend.

### removeItem
Remove an element and allows a callback.

Options :
* element : A timeline element or a child of this element.
* callback : An optional callback function.

If you don't need a callback youdon't need to use a map.
* `$('#selector').timeline('removeItem', myElm)`
* `$('#selector').timeline('removeItem', {element: myElm, callback: function(deletedElmCopy) { // do stuff }})`

### remove
Remove the timeline but you can reload it after.

`$('#selector').timeline('remove')`

### destroy
Destroy the timeline and all properties set.

You can use an optional callback.
* `$('#selector').timeline('destroy')`
* `$('#selector').timeline('destroy', function() { // do stuff })`