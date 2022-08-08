const CONTROLLER = {

  waitingKeypress: function () {
    return new Promise((resolve) => {
      document.addEventListener('keydown', onKeyHandler);
      document.addEventListener('touchstart', handleTouchStart);        
      document.addEventListener('touchmove', handleTouchMove);

      function onKeyHandler(e) {
        for (key in RAWS.settings.keymap) {
          if (e.keyCode === parseInt(key)) {
            document.removeEventListener('keydown', onKeyHandler);
            keyPressed = e.keyCode;
            resolve();
          }
        }
      }

      /* Code below for touchscreen support adapted from 
       * code written by Gaston Silva: https://stackoverflow.com
       * /questions/2264072/detect-a-finger-swipe-through-javascript
       * -on-the-iphone-and-android
       */

      let xDown = null;
      let yDown = null;

      function getTouches(evt) {
        return evt.touches ||             // browser API
        evt.originalEvent.touches;        // jQuery
      }

      function handleTouchStart(evt) {
        const firstTouch = getTouches(evt)[0];                                      
        xDown = firstTouch.clientX;                                     
        yDown = firstTouch.clientY;                                      
      };                                                
                                                                             
      function handleTouchMove(evt) {
    	//detect quadrant
    	//determine slop of line
    	//designate x, y or x+y shift as necessary
    
    	if ( ! xDown || ! yDown ) {
          return;
        }
        	
    	var xUp = evt.touches[0].clientX;                                   		
    	var yUp = evt.touches[0].clientY;
    
        var xDiff = xDown - xUp;
        var yDiff = yDown - yUp;
                    
    	let slope = yDiff/xDiff;
                
    	if (xDiff > 0 && yDiff > 0) {
    	  //Quadrant IV
    	  if (slope < .7) {
    	    keyPressed = 100;
    	  } else if (slope === .7) {
    	    keyPressed = 103;
    	  } else if (slope > .7 && slope < 1.8) {
    	    keyPressed = 103;	
    	  } else if (slope === 1.8) {
    	    keyPressed = 103;
    	  } else if (slope > 1.8) {
    	    keyPressed = 104;
    	  }
    	} else if (xDiff > 0 && yDiff < 0) {
    	  //Quadrant III
    	  if (slope > -.7) {
    	    keyPressed = 100;
    	  } else if (slope === -.7) {
    	    keyPressed = 97;
    	  } else if (slope < -.7 && slope > -1.8) {
    	    keyPressed = 97;	
    	  } else if (slope === -1.8) {
    	    keyPressed = 97;
    	  } else if (slope < -1.8) {
    	    keyPressed = 98;
    	  }
    	} else if (xDiff < 0 && yDiff > 0) {
    	  //Quadrant I
    	  if (slope > -.7) {
    	    keyPressed = 102;
    	  } else if (slope === -.7) {
    	    keyPressed = 105;
    	  } else if (slope < -.7 && slope > -1.8) {
    	    keyPressed = 105;	
    	  } else if (slope === -1.8) {
    	    keyPressed = 105;
    	  } else if (slope < -1.8) {
    	    keyPressed = 104;
    	  }
    	} else if (xDiff < 0 && yDiff < 0) {
    	  //Quadrant II
    	  if (slope < .7) {
    	    keyPressed = 102;
    	  } else if (slope === .7) {
    	    keyPressed = 99;
    	  } else if (slope > .7 && slope < 1.8) {
    	    keyPressed = 99;	
    	  } else if (slope === 1.8) {
    	    keyPressed = 99;
    	  } else if (slope > 1.8) {
    	    keyPressed = 98;
    	  }
    	} else {               
          //This should only fire if one of the x or y values is 0
    	  if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
            if ( xDiff > 0 ) {
              keyPressed = 100; 
            } else {
              keyPressed = 102;
            }                       
          } else {
            if ( yDiff > 0 ) {
              keyPressed = 104;
            } else { 
              keyPressed = 98;
            }                                                                 
          }
        }
        
        /* reset values */
        xDown = null;
        yDown = null;                   
        document.removeEventListener('touchstart', handleTouchStart);        
        document.removeEventListener('touchmove', handleTouchMove);
        resolve();                          
    
      };
    });
  }
};
