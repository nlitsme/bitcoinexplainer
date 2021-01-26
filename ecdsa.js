class ECDSA {
    constructor(ec, g)
    {
        this.ec = ec;
        this.g = g;
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
        var x1 = crack1(k, m1, s1);
        var x2 = crack1(k, m2, s2);
        if (x1==x2)
            return [k, x1];
    }
    crack1(k, m, r, s)
    {
        return s.mul(k).sub(m).div(r);
    }
};
