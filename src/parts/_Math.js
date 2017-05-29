
class Lib {

	static sign (x) {
	  x = +x; // convert to a number
	  if (x === 0 || isNaN(x)) {
	    return x;
	  }
	  return x > 0 ? 1 : -1;
	}

	static angleBetween ( from , to ) {

		var d = to - from,
			d_alt = d > 0 ? d + this.PI2 : d - this.PI2;

		d = Math.abs(d) < Math.abs(d_alt) ? d : d_alt;

		return d

	}

	static clamp ( x , x0 , x1 ) {

		if ( x < x0 ) { return x0 } else if ( x > x1 ) { return x1 } else { return x }

	}

	static mapLinear ( x , x0, x1, y0, y1 ) {

		return (x-x0) / (x1-x0) * (y1-y0) + y0

	}

	static distance (a,b){

		return Math.sqrt( this.distanceSquare(a,b) );

	}

	static distanceSquare (a,b){

		var dx = a.x - b.x, dy = a.y - b.y;
		return dx * dx + dy * dy;

	}

}

Lib.PI2 = Math.PI * 2;

module.exports = Lib;
