const LMath = require('./_Math.js');
const Rectangle = require('./_Rectangle.js');

const CanvasDraw = require('./_CanvasDraw.js');

class Bot {

	constructor () {

		this.parent = undefined;
		this.immobile = false;
		this.age = 0;
		this.dna = Math.random();
		this.heartbeat = LMath.mapLinear(this.dna , 0 , 1 , 0.05 , 0.15 );
		this.r = 12;

		this.maxEyeOffset = this.r * 0.1;
		this.maxEyeVelocity = 3.5;

		//
		this.x = 0; this.y = 0;
		this.vx = 0; this.vy = 0;

		// [ length , rotation , rotational_velocity ]
		this.l1 = [36,0,0];
		this.l2 = [24,0,0];

		//
		this.eyeW = 3.2;
		this.eyeH = 4;

		//
		this.avoid_range = 100;
		this.speed_limit = 3;
		this.speed_decay = 0.6;

		this.cycle_freq_min = 0.2;
		this.cycle_freq_max = 1.0;

		this.arm_velocity_change_damp = 0.2;

	}

	init (bd = 0.35) {
		// Birth Animation
		TweenMax.from( this , bd , {
			r : 0 ,
			ease : Power2.easeInOut
		})
		TweenMax.from( this , bd , {
			eyeW : 0 ,
			eyeH : 0 ,
			delay : 0.2,
			ease : Power2.easeInOut
		})
		TweenMax.from( [this.l1,this.l2] , bd , {
			'0' : 0 ,
			delay : 0.4,
			ease : Power2.easeInOut
		})
	}

	get speed () {return Math.sqrt( this.vx * this.vx + this.vy * this.vy );}
	set speed ( a ) {

		const s = this.speed;
		const f = a / s;

		this.vx *= f;
		this.vy *= f;

	}
	get forward () {
		const s = this.speed;
		return { x: this.vx / s , y: this.vy / s }
	}
	get heading () {return Math.atan2( this.vy , this.vx );}
	get eye () {

		const m = LMath.mapLinear;
		const c = LMath.clamp;
		const dx = m( c( this.vx, -this.maxEyeVelocity, this.maxEyeVelocity ), -this.maxEyeVelocity, this.maxEyeVelocity, -this.maxEyeOffset, this.maxEyeOffset );
		const dy = m( c( this.vy, -this.maxEyeVelocity, this.maxEyeVelocity ), -this.maxEyeVelocity, this.maxEyeVelocity, -this.maxEyeOffset, this.maxEyeOffset );

		return { x: this.x + dx, y: this.y + dy }

	}

	cycle ( freq = 1 ) {

		return Math.cos(
			this.dna +
			this.age * this.heartbeat * freq *
			LMath.mapLinear( this.speed , 0 , this.speed_limit , this.cycle_freq_min , this.cycle_freq_max )
		);

	}
	update (dt) {

		// Cache
		const map = LMath.mapLinear;
		const speed = this.speed;

		// Lines: update Rotation Velocity
		// The long one always point at the trail.
		var df1 = LMath.angleBetween( this.l1[1] , this.heading + Math.PI ) * dt;
		TweenLite.to( this.l1 , this.arm_velocity_change_damp , {
			'2' : LMath.sign(df1) * map( Math.abs(df1) , 0 , LMath.PI2 , 0 , 0.2 )
		});
		this.l1[1] += ( this.l1[2] - this.cycle(0.7) * 0.03 ) * dt;
		// The short one always oscillate around the long one
		var df2 = LMath.angleBetween( this.l2[1] , this.l1[1] ) * dt;
		TweenLite.to( this.l2 , this.arm_velocity_change_damp , {
			'2' : LMath.sign(df2) * map( Math.abs(df2) , 0 , LMath.PI2 , 0 , 0.6 )
		});
		this.l2[1] += ( this.l2[2] + this.cycle(1) * 0.1 ) * dt;
		// The lines' momentum will also effect velocity
		// var tr = (this.l2[1] * this.l2[0] + this.l1[1] * this.l1[0]) / (this.l2[0] + this.l1[0]);
		var tr = (this.l2[1] + this.l1[1]) * 0.5
		this.vx -= Math.cos(tr) * 0.05 * dt;
		this.vy -= Math.sin(tr) * 0.05 * dt;

		// Slow bot down if too fast
		if (speed > this.speed_limit) {
			this.vx *= this.speed_decay;
			this.vy *= this.speed_decay;
		}

		// Detect other bots
		const others = this.parent.quadtree.retrieve( [] , new Rectangle( this.x , this.y , 0 , 0 ) )
		others.forEach( (obj) => {

			const obot = obj.reference;
			if (obot === this) {return;}

			const v = { x: obot.x - this.x, y: obot.y - this.y };
			const d = Math.sqrt( v.x * v.x + v.y * v.y );

			if (d < this.r + obot.r ) {

				const uv = { x: v.x / d, y: v.y / d };
				this.vx -= uv.x * dt;
				this.vy -= uv.y * dt;
				obot.vx += uv.x * dt;
				obot.vy += uv.y * dt;

			} else if (d < 70) {

				// Avoiding
				const p = this.avoid_range;
				this.vx -= map( v.x , -p , p , -0.4 , 0.4 ) * dt;
				this.vy -= map( v.y , -p , p , -0.4 , 0.4 ) * dt;

			}

		});

		// Move the bot
		if (this.immobile !== true) {
			this.x += this.vx * dt;
			this.y += this.vy * dt;
		} else {
			this.vx *= this.speed_decay;
			this.vy *= this.speed_decay;
		}

		// Aging
		this.age += dt;

	}
	draw () {
		// drawing process:
		// [1] draw bottom line
		// [2] erase background of the whole circle
		// [3] draw top line
		// [4] erase background of "10"
		// [5] draw 10
		// [6] draw outer circle

		// Cache
		const ctx = this.parent.context;
		const eye = this.eye;
		const forward = this.forward;
		const fx = forward.x * this.eyeW;
		const fy = forward.y * this.eyeW;

		// [1] draw bottom line
		CanvasDraw.Stroke( ctx , () => {
			CanvasDraw.Line(ctx,
				eye.x + fy,
				eye.y - fx,
				eye.x + Math.cos(this.l1[1]) * this.l1[0] + fy,
				eye.y + Math.sin(this.l1[1]) * this.l1[0] - fx
			);
		} )
		// [2] erase background of the whole circle
		CanvasDraw.FillCircle( ctx , this.x , this.y , this.r );
		// [3] draw top line
		CanvasDraw.Stroke( ctx , () => {
			CanvasDraw.Line(ctx,
				eye.x - fy,
				eye.y + fx,
				eye.x + Math.cos(this.l2[1]) * this.l2[0] - fy,
				eye.y + Math.sin(this.l2[1]) * this.l2[0] + fx
			);
		} )
		// [4] erase background of "10"
		CanvasDraw.FillCircle( ctx , eye.x , eye.y , this.eyeH * 2 );
		// [5] draw 10
		CanvasDraw.Stroke( ctx , () => {
			// 1
			const x = eye.x - this.eyeW;
			CanvasDraw.Line( ctx , x , eye.y - this.eyeH , x , eye.y + this.eyeH );
		})
		CanvasDraw.Stroke( ctx , () => {
			// 0
			ctx.arc( eye.x + this.eyeW, eye.y , this.eyeH , 0 , Math.PI * 2 )
		})
		// [6] draw outer circle
		CanvasDraw.Stroke( ctx , () => {
			ctx.arc( this.x , this.y , this.r , 0 , Math.PI * 2 )
		})
		// [END]
	}

	destroy () {
		TweenMax.killTweensOf(this);
		for (var p in this) { if (this.hasOwnProperty(p)) { this[p] = null; } }
	}

}

module.exports = Bot
