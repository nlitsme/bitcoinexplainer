/* Author: Willem Hengeveld <itsme@xs4all.nl> */
/* https://github.com/nlitsme/bitcoinexplainer */

// This is the bitcoin curve, using javascript bignum integers.
function secp256k1()
{
    var f = new GaloisField(2n**256n-2n**32n-977n);
    f.fieldtag = "coord";
    var ec = new EllipticCurve(f, 0n, 7n);
    var g = ec.point( 0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798n, 0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8n);
    ec.order = new GaloisField(2n**256n-432420386565659656852420866394968145599n);
    ec.order.fieldtag = "scalar";
    return new ECDSA(ec, g);
}
