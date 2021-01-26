class ECDSA {
    constructor(ec, g)
    {
        this.ec = ec;
        this.g = g;
    }
    scalar(x)
    {
        return this.ec.order.value(x);
    }

    calcpub(x)
    {
        return this.g.mul(x);
    }
    sign(m, x, k)
    {
        var R = this.g.mul(k);
        var s = m.add(x.mul(R.x)).div(k);
        return [R.x, s];
    }
    verify(m, Y, r, s)
    {
        var R = this.g.mul(m).add(Y.mul(r)).div(s);
        return r==R.x;
    }
    crack2(r, m1, m2, s1, s2)
    {
        var k = m1.sub(m2).div(s1.sub(s2))
        var x1 = this.crack1(k, m1, r, s1);
        var x2 = this.crack1(k, m2, r, s2);
        if (x1.equals(x2))
            return [k, x1];
        console.log("k=", k);
        console.log("x1=", x1);
        console.log("x2=", x2);
        return [0, 0];
    }
    crack1(k, m, r, s)
    {
        return s.mul(k).sub(m).div(r);
    }
};
