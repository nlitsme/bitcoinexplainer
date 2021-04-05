/* Author: Willem Hengeveld <itsme@xs4all.nl> */
/* https://github.com/nlitsme/bitcoinexplainer */
"use strict";

/* Finite field arithmetic */

/* this class represents a value in a finite field */
class Value {
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

    int() { return this.num; }
    uint() { return this.num<0 ? this.num+this.field.p : this.num; }

    toString() { return this.field+":0x"+this.num.toString(16); }
};

/* this class represents a finite field */
class GaloisField {
    constructor(p) { this.p = p; }
    toString() {
        if ("fieldtag" in this)
            return this.fieldtag;
        else
            return "FIELD(0x"+this.p.toString(16)+")";
    }

    value(x)
    {
        // force x to be of this galois field.
        return new Value(this, numval(x) % this.p);
    }
    add(lhs, rhs) { this.checkfields(lhs, rhs); return this.value(numval(lhs)+numval(rhs)); }
    sub(lhs, rhs) { this.checkfields(lhs, rhs); return this.value(numval(lhs)-numval(rhs)); }
    neg(a) { return this.value(-numval(a)); }
    mul(lhs, rhs) { this.checkfields(lhs, rhs); return this.value(numval(lhs)*numval(rhs)); }
    inverse(a) { return this.value(modinv(numval(a), this.p)); }
    div(lhs, rhs) { this.checkfields(lhs, rhs); return this.mul(lhs, rhs.inverse()); }
    pow(lhs, rhs) { return this.value(modexp(numval(lhs), numval(rhs), this.p)); }

    checkfields() {
        for (var x of arguments)
            if (x && x.field && x.field.p != this.p)
            {
                console.log("incorrect field", x.field.p, this.p);
                throw "incorrect field";
            }
    }

    legendre(a) {
        var [_, exp] = numshr(this.p-numone(this.p));
        var ls = a.pow(exp);
        return ls.equals(cvnum(-1, this.p)) ? -1 : 1;
    }

    sqrt(a, n)
    {
        if (a.iszero())
            return a;
        if (this.p==cvnum(2, this.p))
            return a;
        if (this.legendre(a) != 1)
            return;


        var sw = Number(this.p % cvnum(4, this.p));
        if (sw==3)
        {
            var [_, exp] = numshr(this.p+numone(this.p));
            [_, exp] = numshr(exp);
            var res = a.pow(exp);

            return (Number(numshr(res)[0]) == n) ? res : res.neg();
        }
        var s = this.p-numone(this.p); // an int
        var e = 0; // an int
        while (true) {
            var [bit, res] = numshr(s);
            if (bit)
                break;
            s = res;
            e++;
        }

        var k = this.value(cvnum(2,this.p));
        while (this.legendre(k)!=-1) {
            k = k.add(numone(this.p));
        }

        var [_, ss] = numshr(s+numone(this.p)); // an int
        var x = a.pow(ss);
        var b = a.pow(s);
        var g = k.pow(s);
        var r = e; // an int
        while (true) {
            var t = b;
            var m = 0; // an int
            while (m<r) {
                if (t.equals(numone(this.p)))
                    break;
                t = t.square();
                m++;
            }
            if (m==0)
                return (Number(numshr(x)[0]) == n) ? x : x.neg();
            if (m==r)
                m = r-1;

            var gs = g.pow(2**(r-m-1));
            g = gs.square();
            x = x.mul(gs);
            b = b.mul(g);
            r = m;
            //console.log("(p=",this.p,") ", a, n, ":", t, m, g, x, b);
        }
    }
    cubert(a, n)
    {
        function onemod(p, r)
        {
            var two = cvnum(2, p);
            var one = cvnum(1, p);
            var t = p-two;
            while (numequals(modexp(t, (p-one)/r, p), one))
                t -= one;
            return modexp(t, (p-one)/r, p);
        }
        function solution(p, root, n)
        {
            if (n==0) {
                //console.log("first root", root);
                return root;
            }
            var g = onemod(p, cvnum(3, p));
            root = root.mul(g);
            if (n==1) {
                //console.log("second root", root);
                return root;
            }
            //console.log("third root", root);
            return root.mul(g);
        }
        if (numequals(this.p, cvnum(2, this.p)))
            return a;
        if (numequals(this.p, cvnum(3, this.p)))
            return a;
        if (numiszero(a))
            return a;
        if (numequals(this.p % cvnum(3, this.p), cvnum(2, this.p)))
            return a.pow((this.p+this.p-numone(this.p))/cvnum(3, this.p));

        var x = a.pow((this.p-numone(this.p))/cvnum(3, this.p));
        if (numval(x)>numone(this.p)) {
            //console.log(x, ">", numone(this.p));
            return;
        }

        var sw = Number(numval(this.p) % cvnum(27, this.p));
        //console.log("sw=", sw);
        if (sw%9 == 4) {
            //console.log("p=", this.p);
            //console.log("9=", cvnum(9, this.p));
            //console.log("1=", numone(this.p));
            //console.log("e=", (this.p+this.p + numone(this.p))/cvnum(9, this.p));
            var root = a.pow((this.p+this.p + numone(this.p))/cvnum(9, this.p))
            if (root.pow(3).equals(a)) return solution(this.p, root, n)
        }
        else if (sw%9 == 7) {
            var root = a.pow((this.p + cvnum(2, this.p))/cvnum(9, this.p));
            if (root.pow(3).equals(a)) return solution(this.p, root, n);
        }
        else if (sw == 10) {
            var root = a.pow((this.p+this.p + cvnum(7, this.p))/cvnum(27, this.p));
            var h = onemod(this.p, cvnum(9, this.p));
            for (var i=0 ; i<9 ; i++) {
                if (root.pow(3).equals(a)) return solution(this.p, root, n);
                root = root.mul(h);
            }
        }
        else if (sw == 19) {
            var root = a.pow((this.p + cvnum(8, this.p))/cvnum(27, this.p));
            var h = onemod(this.p, cvnum(9, this.p));
            for (var i=0 ; i<9 ; i++) {
                if (root.pow(3).equals(a)) return solution(this.p, root, n);
                root = root.mul(h);
            }
        }
        else {
            console.log("unhandled cuberot, p%27=", sw);
        }
    }


    zero() { return numzero(this.p); } // todo: handle bigint as well.
    iszero(x) { return numval(x)==numzero(this.p); }

    equals(lhs, rhs) { this.checkfields(lhs, rhs); return lhs.sub(rhs).iszero(); }
    shr(x) { 
        var [bit, res] = numshr(numval(x));
        return [bit, this.value(res)];
    }

    equalsfield(f)
    {
        return numequals(this.p, f.p);
    }
};
