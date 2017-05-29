var QuadTree = require('./_QuadTree.js');
var Rectangle = require('./_Rectangle.js');
var Bot = require('./_Bot.js');

class Pool {

	constructor ( canvas ) {

		this.canvas = canvas;
		this.context = this.canvas.getContext("2d");
		this.pool = [];
		this.quadtree = new QuadTree( 1, new Rectangle( 0, 0, this.canvas.width, this.canvas.height ));
		this.age = 0;
		this.style = {
			fillStyle: "#FFF",
			strokeStyle: "#000",
			lineWidth: 2,
			lineCap: "round",
			lineJoin: "round"
		}

		this.needsUpdate = false;

		this.bound = {
			left : -50 ,
			right : 50 ,
			top : -50 ,
			bottom : 50
		}

	}

	contains (bot) {

		return bot.x < this.canvas.width + this.bound.right &&
		       bot.y < this.canvas.height + this.bound.bottom &&
		       bot.x > this.bound.left &&
		       bot.y > this.bound.top ;

	}

	update (step = 1) {

		var pool = this;

		this.needsUpdate = pool.age % 2 === 0;

		if (this.needsUpdate) {
			pool.quadtree.clear();
			pool.each( function( bot ){
				pool.quadtree.insert(new Rectangle(
          bot.x - bot.r,
          bot.y - bot.r,
          bot.r,
          bot.r,
          bot
        ))
			})
		}

		pool.each( function( bot ){
			if ( pool.contains(bot) ) {
				bot.update( step );
			} else {
				pool.killBot( bot );
				pool.addBot();
			}
		} );

		this.age += 1;

	}

	draw () {

		if (this.needsUpdate) {
			// set style
			this.context.fillStyle   = this.style.fillStyle;
			this.context.strokeStyle = this.style.strokeStyle;
			this.context.lineWidth   = this.style.lineWidth;
			this.context.lineCap     = this.style.lineCap;
			this.context.lineJoin    = this.style.lineJoin;
		}

		this.context.clearRect( 0, 0, this.canvas.width, this.canvas.height );
		this.each( function( obj ){ obj.draw(); } );

	}

	each (fn) { this.pool.forEach(fn); }

	addBot (options = {}) {

		var bot = new Bot();
		bot.parent = this;

		bot.x = options.hasOwnProperty('x') ? options.x : this.canvas.width * Math.random();
		bot.y = options.hasOwnProperty('y') ? options.y : this.canvas.height * Math.random();
		bot.vx = options.hasOwnProperty('vx') ? options.vx : 2 - 4 * Math.random();
		bot.vy = options.hasOwnProperty('vy') ? options.vy : 2 - 4 * Math.random();

		this.pool.push(bot);
		bot.init();

	}

	killBot (bot) {

		bot.destroy();

		this.pool.splice( this.pool.indexOf( bot ) , 1 );

	}

}

module.exports = Pool;
