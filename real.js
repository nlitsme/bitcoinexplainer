/* Author: Willem Hengeveld <itsme@xs4all.nl> */
/* https://github.com/nlitsme/bitcoinexplainer */
"use strict";

/* real number arithmetic */

function numequals(a, b)
{
    return Math.abs(a-b) < 0.0001;
}
function realval(x)
{
    if (x instanceof RealValue) { return x.real(); }
    return x;
}
/* this class represents a real value */
class RealValue {
    constructor(field, num)
    {
        this.field = field;
        this.num = num;
    }
    add(rhs) { return this.field.add(this, rhs); }
    double() { return this.field.add(this, this); }
    thrice() { return this.field.add(this.double(), this); }
    sub(rhs) { return this.field.sub(this, rhs); }
    mul(rhs) { return this.field.mul(this, rhs); }
    square() { return this.field.mul(this, this); }
    cube() { return this.field.mul(this.square(), this); }
    div(rhs) { return this.field.div(this, rhs); }
    pow(rhs) { return this.field.pow(this, rhs); }
    sqrt(n) { return this.field.sqrt(this, n); }
    cubert(n) { return this.field.cubert(this, n); }
    neg() { return this.field.neg(this); }
    inverse() { return this.field.inverse(this); }
    iszero() { return this.field.iszero(this); }
    equals(rhs) { return this.field.equals(this, rhs); }

    shr() { return this.field.shr(this); }

    real() { return this.num; }

    toString() { return this.num.toFixed(8); }
};

/* this class represents the real numbers */
class RealNumbers {
    constructor() {  }
    toString() {
        return "real";
    }

    value(x)
    {
        // force x to be a real number.
        return new RealValue(this, realval(x));
    }
    add(lhs, rhs) { this.checkfields(lhs, rhs); return this.value(realval(lhs)+realval(rhs)); }
    sub(lhs, rhs) { this.checkfields(lhs, rhs); return this.value(realval(lhs)-realval(rhs)); }
    neg(a) { return this.value(-realval(a)); }
    mul(lhs, rhs) { this.checkfields(lhs, rhs); return this.value(realval(lhs)*realval(rhs)); }
    inverse(a) { return realval(a) ? this.value( 1 / realval(a)) : Infinity; }
    div(lhs, rhs) { this.checkfields(lhs, rhs); return this.mul(lhs, rhs.inverse()); }
    pow(lhs, rhs) { return this.value(realval(lhs) ** realval(rhs)); }

    checkfields() {
        return true;
    }

    sqrt(a, n)
    {
        return this.value(n ? -Math.sqrt(a.real()) : Math.sqrt(a.real()));
    }
    cubert(a, n)
    {
        return this.value(a.real()**(1/3));
    }


    zero() { return 0.0; }
    iszero(x) { return Math.abs(realval(x)) < 0.0001; }

    equals(lhs, rhs) { this.checkfields(lhs, rhs); return lhs.sub(rhs).iszero(); }
    shr(x) { 
        var [bit, res] = numshr(realval(x));
        return [bit, this.value(res)];
    }

    equalsfield(f)
    {
        return true;
    }
};
