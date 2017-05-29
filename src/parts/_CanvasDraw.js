const LMath = require('./_Math.js');

class CanvasDraw {

	static Line ( _ctx , x0 , y0 , x1 , y1 ) {

		_ctx.moveTo( x0 , y0 );
		_ctx.lineTo( x1 , y1 );

	}

	static Stroke ( _ctx , _fn ) {

		_ctx.beginPath();
		_fn();
		_ctx.closePath();
		_ctx.stroke();

	}

	static FillCircle ( _ctx , x , y , r ) {

		_ctx.beginPath();
		_ctx.arc(x, y, r, 0, LMath.PI2);
		_ctx.fill();

	}

}

module.exports = CanvasDraw;
