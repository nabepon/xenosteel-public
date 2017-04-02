/*
* IScroll‚ÌC³•ªƒpƒbƒ`
* iscroll.js version 5.1.1
*/

(function (window, document, Math, IScroll) {

// utils‚ð–Y‚ê‚¸Ž‚Á‚Ä‚«‚Ä‚¨‚­
var utils = IScroll.utils;

IScroll.prototype._init = function () {
		/* ‚±‚±‚©‚ç’Ç‰Á•ª */
		this.options.moveTime = 0;
		this.options.keepDirection = 0;
		if(window.navigator.userAgent.search(/AppleWebKit\/534\.30/) == -1 ){
			this.options.useKeepDirection = false;
		}else{
			this.options.useKeepDirection = true;
		}
		/* ‚±‚±‚Ü‚Å’Ç‰Á•ª */

		this._initEvents();

		if ( this.options.scrollbars || this.options.indicators ) {
			this._initIndicators();
		}

		if ( this.options.mouseWheel ) {
			this._initWheel();
		}

		if ( this.options.snap ) {
			this._initSnap();
		}

		if ( this.options.keyBindings ) {
			this._initKeys();
		}

// INSERT POINT: _init

};

IScroll.prototype._move = function (e) {
		if ( !this.enabled || utils.eventType[e.type] !== this.initiated ) {
			return;
		}

		if ( this.options.preventDefault ) {	// increases performance on Android? TODO: check!
			e.preventDefault();
		}

		/* ‚±‚±‚©‚ç’Ç‰Á•ª */
		if(this.options.useKeepDirection){
			var _point		= e.touches ? e.touches[0] : e;
			var _deltaY		= _point.pageY - this.pointY;
			var _directionY = _deltaY > 0 ? -1 : _deltaY < 0 ? 1 : 0;
			var now = Date.now();
			if(this.options.keepDirection === 0){
				this.options.keepDirection = _directionY;
			}
			if(this.options.keepDirection != _directionY){
				if(now - this.options.moveTime > 300 ){
					this.options.keepDirection = 0;
				}else{
					return
				}
			}
			this.options.moveTime = now;
		}
		/* ‚±‚±‚Ü‚Å’Ç‰Á•ª */
		
		var point		= e.touches ? e.touches[0] : e,
			deltaX		= point.pageX - this.pointX,
			deltaY		= point.pageY - this.pointY,
			timestamp	= utils.getTime(),
			newX, newY,
			absDistX, absDistY;

		this.pointX		= point.pageX;
		this.pointY		= point.pageY;

		this.distX		+= deltaX;
		this.distY		+= deltaY;
		absDistX		= Math.abs(this.distX);
		absDistY		= Math.abs(this.distY);

		// We need to move at least 10 pixels for the scrolling to initiate
		if ( timestamp - this.endTime > 300 && (absDistX < 10 && absDistY < 10) ) {
			return;
		}

		// If you are scrolling in one direction lock the other
		if ( !this.directionLocked && !this.options.freeScroll ) {
			if ( absDistX > absDistY + this.options.directionLockThreshold ) {
				this.directionLocked = 'h';		// lock horizontally
			} else if ( absDistY >= absDistX + this.options.directionLockThreshold ) {
				this.directionLocked = 'v';		// lock vertically
			} else {
				this.directionLocked = 'n';		// no lock
			}
		}

		if ( this.directionLocked == 'h' ) {
			if ( this.options.eventPassthrough == 'vertical' ) {
				e.preventDefault();
			} else if ( this.options.eventPassthrough == 'horizontal' ) {
				this.initiated = false;
				return;
			}

			deltaY = 0;
		} else if ( this.directionLocked == 'v' ) {
			if ( this.options.eventPassthrough == 'horizontal' ) {
				e.preventDefault();
			} else if ( this.options.eventPassthrough == 'vertical' ) {
				this.initiated = false;
				return;
			}

			deltaX = 0;
		}

		deltaX = this.hasHorizontalScroll ? deltaX : 0;
		deltaY = this.hasVerticalScroll ? deltaY : 0;

		newX = this.x + deltaX;
		newY = this.y + deltaY;

		// Slow down if outside of the boundaries
		if ( newX > 0 || newX < this.maxScrollX ) {
			newX = this.options.bounce ? this.x + deltaX / 3 : newX > 0 ? 0 : this.maxScrollX;
		}
		if ( newY > 0 || newY < this.maxScrollY ) {
			newY = this.options.bounce ? this.y + deltaY / 3 : newY > 0 ? 0 : this.maxScrollY;
		}

		this.directionX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
		this.directionY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

		if ( !this.moved ) {
			this._execEvent('scrollStart');
		}

//console.log("_move: "+"  point.pageY = "+point.pageY+"  absDistY = "+absDistY+"  deltaY = "+deltaY+"  newY = "+newY+" directionY = "+this.directionY);

		this.moved = true;

		this._translate(newX, newY);

/* REPLACE START: _move */

		if ( timestamp - this.startTime > 300 ) {
			this.startTime = timestamp;
			this.startX = this.x;
			this.startY = this.y;
		}

/* REPLACE END: _move */

};

IScroll.prototype._translate = function (x, y) {
		if ( this.options.useTransform ) {

/* REPLACE START: _translate */

			this.scrollerStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.translateZ;

/* REPLACE END: _translate */

		} else {
			x = Math.round(x);
			y = Math.round(y);
			this.scrollerStyle.left = x + 'px';
			this.scrollerStyle.top = y + 'px';
		}

//		console.log("####_translate: " + this.scrollerStyle[utils.style.transform] + " / " + this.scrollerStyle.top);

		this.x = x;
		this.y = y;


	if ( this.indicators ) {
		for ( var i = this.indicators.length; i--; ) {
			this.indicators[i].updatePosition();
		}
	}


// INSERT POINT: _translate

};

})(window, document, Math, IScroll);

