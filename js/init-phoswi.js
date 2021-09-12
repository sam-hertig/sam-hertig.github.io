// This is used by Hertig Visualizations main websites


var initPhotoSwipeFromDOM = function(gallerySelector) {

    // triggers when user clicks on thumbnail
    var onThumbnailsClick = function(e) {
        e = e || window.event;
        e.preventDefault ? e.preventDefault() : e.returnValue = false;

        var eTarget = e.target || e.srcElement;

        // reactivate links
        if (eTarget.nodeName.toLowerCase() === 'a') {
            window.open(eTarget.href, '_blank');
            e.stopPropagation(); // prevent camera from zooming out (also deactivates links)
            return;          
        }

        // find root element of slide
        var clickedListItem = closest(eTarget, function(el) {
            return (el.className && el.className.indexOf('figure') > 1);
        });

        if(!clickedListItem || (eTarget.nodeName.toLowerCase() !== 'img') ) {
            return;
        }

        e.stopPropagation(); // prevent camera from zooming out (also deactivates links)

        var index = null;
        var childNodes = document.getElementsByClassName("figure");

        for (var i = 0; i < childNodes.length; i++) {
            if(childNodes[i].nodeType !== 1) { 
                continue; 
            }
            if(childNodes[i] === clickedListItem) {
                index = i;
                break;
            }
        }

        if(index >= 0) {
            openPhotoSwipe(index);
        }
        return false;
    };

    // find nearest parent element
    var closest = function closest(el, fn) {
        return el && ( fn(el) ? el : closest(el.parentNode, fn) );
    };

    // opens slideshow
    var openPhotoSwipe = function(index) { 
        
        var pswpElement = document.querySelectorAll('.pswp')[0],
            items = parseThumbnailElements();

        // define options (if needed)
        var options = {

            getThumbBoundsFn: function(index) {
                // see options -> getThumbBoundsFn section of documentation for more info
                var thumbnail = items[index].el.getElementsByTagName('img')[0], 
                    pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                    rect = thumbnail.getBoundingClientRect(); 

                return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
            },

            index: parseInt(index, 10),

            history: false,

            preload: [1,1],

            bgOpacity: 0.9

        };

        // exit if index not found
        if( isNaN(options.index) ) {
            return;
        }

        // pass data to PhotoSwipe and initialize it
        var gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
        gallery.init();

        // listen to back button clicks for closing gallery:
        gallery.listen('destroy', function() {
            state = 2;
        });
        window.addEventListener("hashchange", galleryHash, false);
        state = 4;
        function galleryHash(event) {
            gallery.close();
            window.location.href = '#graphics';
            window.removeEventListener("hashchange", galleryHash, false);
        }
               

    };

    // parse slide data (url, title, size ...) from DOM elements 
    var parseThumbnailElements = function() {
        var thumbElements = document.getElementsByClassName("figure"),
            items = [],
            figureEl,
            linkEl,
            size,
            item;

        for(var i = 0; i < thumbElements.length; i++) {

            figureEl = thumbElements[i]; // element w/ figure class

            // include only element nodes 
            if(figureEl.nodeType !== 1) {
                continue;
            }

            linkEl = figureEl.children[0]; // <a> element

            size = linkEl.getAttribute('data-size').split('x');

            // create slide object
            item = {
                src: linkEl.getAttribute('href'),
                w: parseInt(size[0], 10),
                h: parseInt(size[1], 10)
            };

            if(figureEl.children.length > 1) {
                // caption content
                item.title = figureEl.children[1].innerHTML; 
            }

            if(linkEl.children.length > 0) {
                // <img> thumbnail element, retrieving thumbnail url
                item.msrc = linkEl.children[0].getAttribute('src');
            } 

            item.el = figureEl; // save link to element for getThumbBoundsFn
            items.push(item);
        }

        return items;
    };

    // loop through all gallery elements and bind events
    var galleryElements = document.querySelectorAll( gallerySelector );

    for(var i = 0, l = galleryElements.length; i < l; i++) {
        galleryElements[i].setAttribute('data-pswp-uid', i+1);
        galleryElements[i].onclick = onThumbnailsClick;
    }

};