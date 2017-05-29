class Example {

	constructor( canvas ) {

		this.bot_count = 30;
		this.speed = 1.0;
		this.max_grab_distance = 30;

		this.canvas = canvas;
		this.pool = new LLLogo.Pool( canvas );
		this.captured = null;

		this.resize();
		window.addEventListener( "resize" , this.resize.bind(this) );
		window.requestAnimationFrame( this.onEnterFrame.bind(this) );

		for( var i = 0 ; i < this.bot_count ; i ++ ) {

			TweenMax.delayedCall( 0.01 * i + Math.random() * 2 , () => {
				this.pool.addBot()
			})

		}

		this.canvas.addEventListener( "mousemove" , this.onMouseMove.bind(this) );
		this.canvas.addEventListener( "mousedown" , this.onMouseDown.bind(this) );
		this.canvas.addEventListener( "mouseup" , this.onMouseUp.bind(this) );

		this.context = canvas.getContext('2d')

	}

	resize () {

		this.width = window.innerWidth
		this.height = window.innerHeight
		this.canvas.width = this.width;
		this.canvas.height = this.height;

	}

	onEnterFrame () {

		this.pool.update(this.speed);
		this.pool.draw();
		window.requestAnimationFrame( this.onEnterFrame.bind(this) );

	}

	onMouseDown ( evt ) {

		const mouse = new LLLogo.Rectangle( evt.clientX , evt.clientY , 0 , 0 );
		const query = this.pool.quadtree.retrieve([],mouse);

		let candidate_dist = this.max_grab_distance;
		let candidate = null;
		query.forEach( function(obj){
			const obot = obj.reference;
			const dist = LLLogo.Math.distance( mouse , obot );
			if ( dist < candidate_dist ) {
				candidate = obot;
				candidate_dist = dist;
			}
		} );

		this.captured = candidate;
		if (this.captured) {
			this.captured.immobile = true;
			this.moveBotTo( this.captured , evt.clientX , evt.clientY , 0.5 );
		}

	}

	onMouseMove ( evt ) {

		if (this.captured) {
			this.moveBotTo( this.captured , evt.clientX , evt.clientY , 0 );
		}

	}

	onMouseUp ( evt ) {

		if (this.captured) {
			TweenMax.killTweensOf( this.captured );
			// Release
			this.captured.immobile = false;
			this.captured = null;
		}

	}

	moveBotTo ( bot , x , y , t = 0 , ease = Power2.easeOut ) {

		TweenLite.to( bot.l1 , 0.2 + t , {
			'1' : Math.atan2( y - bot.y , x - bot.x ) + Math.PI
		});
		TweenLite.to( bot , t , { x : x , y : y , ease : ease } );

	}

}

const canvas = document.getElementById('example')
const example = new Example(canvas)
