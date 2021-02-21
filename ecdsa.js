/* Elliptic curve Digital Signature Algorithm */

class ECDSA {
    constructor(ec, G)
    {
        this.ec = ec;
        this.G = G;
    }
    // changes 'x' to be of galois field 'n'
    scalar(x) { return this.ec.order.value(x); }

    /* calculate a public key from a private key.
     *
     * Return value: the public key point.
     */
    calcpub(x)
    {
        return this.G.mul(x);
    }

    /* create a signature.
     *
     * Return value: a tuple of 'r' and 's'.
     */
    sign(m, x, k)
    {
        var R = this.G.mul(k);
        var s = m.add(x.mul(this.scalar(R.x))).div(k);
        return [R.x, s];
    }

    /* Verify a signature.
     *
     * Return value: true when the signature is correct.
     */
    verify(m, Y, r, s)
    {
        var R = this.G.mul(m).add(Y.mul(r)).div(s);
        return r.equals(this.scalar(R.x));
    }

    /* Crack a key given a pair of signatures with the same 'r'.
     *
     * Return value: a tuple of the signing secret, and the secret key.
     */
    crack2(r, m1, m2, s1, s2)
    {
        var k = m1.sub(m2).div(s1.sub(s2))
        var x1 = this.crack1r(k, m1, r, s1);
        var x2 = this.crack1r(k, m2, r, s2);
        if (x1.equals(x2))
            return [k, x1];
        console.log("unexpectedly: x1 != x2");
        console.log("k=", k);
        console.log("x1=", x1);
        console.log("x2=", x2);
        return [0, 0];
    }

    /* this variant of crack1 assumes we already have calculated 'r',
     * and can directly calculate 'x'.
     *
     * Return value: the secret key
     */
    crack1r(k, m, r, s)
    {
        return s.mul(k).sub(m).div(r);
    }

    /* this variant of crack1, calculates r, then calls crack1r.
     *
     * Return value: the secret key
     */
    crack1(k, m, s)
    {
        var R = this.G.mul(k);
        // we have to convert the x coord of R from the galois field with order 'p'
        // to the field with order 'n'
        return this.crack1r(k, m, this.scalar(R.x), s);
    }
    findk(m, x, r, s)
    {
        return m.add(x.mul(r)).div(s);
    }
    findpk(m, r, s, flag)
    {
        var R = this.ec.decompress(this.ec.coord(r), flag);
        return R.mul(s.div(r)).sub(this.G.mul(m.div(r)));
    }
};
