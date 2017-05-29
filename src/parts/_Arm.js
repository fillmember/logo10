class Arm {

	constructor (p,l,r,v) {

		this.parent = p;

		this.length = l;
		this.rotation = r;
		this.velocity = v;

		this.damp = 0.2;

		this.immobile = false;

	}

}

module.exports = Arm
