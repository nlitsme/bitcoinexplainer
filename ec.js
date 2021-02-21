/*
    A Weierstrass Elliptic Curve

    y^2 == x^3+x*a+b
*/


/* this class represents a point on the specified curve */
class Point {
    constructor(curve, x, y)
    {
        this.curve = curve;
        this.x = x;
        this.y = y;
    }
    add(rhs) { return this.curve.add(this, rhs); }
    double() { return this.curve.add(this, this); }
    sub(rhs) { return this.curve.sub(this, rhs); }
    mul(rhs) { return this.curve.mul(this, rhs); }
    div(rhs) { return this.curve.div(this, rhs); }

    neg() { return this.curve.neg(this); }
    isinf() { return typeof(this.x) == "undefined"; }
    equals(rhs) { return this.curve.equals(this, rhs); }
    isoncurve() { return this.curve.isoncurve(this); }
};

/* this class represents the elliptic curve */
class EllipticCurve {
    constructor(field, a, b) {
        this.field = field;
        this.a = a;
        this.b = b;
        this.order = undefined;
    }

    point(x, y)
    {
        if (x instanceof Point)
            return x;
        if (typeof(x) == "undefined")
            return new Point(this, undefined, undefined);
        return new Point(this, this.coord(x), this.coord(y));
    }
    decompress(x, flag)
    {
        var y2 = x.cube().add(x.mul(this.a)).add(this.b);
        return this.point(x, y2.sqrt(flag));
    }
    ydecompress(y, flag)
    {
        if (!numiszero(this.a)) {
            console.log("ydecompress only works for curves where a==0");
            return;
        }
        var x = y.square().sub(this.b).cubert(flag);
        return this.point(x, y);
    }

    // changes 'x' to be of galois field 'p'
    coord(x) { return this.field.value(x); }
    add(lhs, rhs)
    {
        if (lhs.isinf()) return rhs;
        if (rhs.isinf()) return lhs;
        var l;
        if (lhs.equals(rhs)) {
            if (lhs.y.iszero())
                return this.infinity();
            l = lhs.x.square().thrice().add(this.a).div(lhs.y.double());
        }
        else if (lhs.x.equals(rhs.x))
            return this.infinity();
        else {
            l = lhs.y.sub(rhs.y).div(lhs.x.sub(rhs.x));
        }
        var x = l.square().sub(lhs.x.add(rhs.x));
        var y = l.mul(lhs.x.sub(x)).sub(lhs.y);

        return this.point(x, y);
    }
    sub(lhs, rhs) { return this.add(lhs, this.neg(rhs)); }
    neg(p) { return this.point(p.x, p.y.neg()); }
    mul(lhs, rhs)
    {
        if (rhs instanceof Point) {
            // handle: scalar * point
            return this.mul(rhs, lhs);
        }
        // handle:  point * scalar
        var accu = this.infinity();
        var shifter = lhs;
        var scalar = rhs;
        var bit;
        while (!numiszero(scalar))
        {
            [bit, scalar] = numshr(scalar);
            if (bit)
                accu = accu.add(shifter);
            shifter = shifter.add(shifter);
        }
        return accu;
    }
    equals(lhs, rhs) {
        if (lhs.isinf() && rhs.isinf())
            return true;
        if (lhs.isinf() || rhs.isinf())
            return false;
        return lhs.x.equals(rhs.x) && lhs.y.equals(rhs.y);
    }
    div(lhs, rhs) { return this.mul(lhs, rhs.inverse()); } // needs group order.

    infinity() { return this.point(undefined, undefined); }

    isoncurve(p) { this.checkcurve(p); return p.isinf() || p.y.square().equals(p.x.cube().add(p.x.mul(this.a)).add(this.b)); }

    checkcurve(p)
    {
        if (!this.equalscurve(p.curve))
            console.log("point belongs to a different curve");
    }
    equalscurve(c)
    {
        return numequals(this.a, c.a) && numequals(this.b, c.b) && this.field.equalsfield(c.field);
    }
};

