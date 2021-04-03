/* Author: Willem Hengeveld <itsme@xs4all.nl> */
/* https://github.com/nlitsme/bitcoinexplainer */

/*
 * These functions are intended to make a single codebase work with both the Bignum and Number types in javascript.
 */

// return the number zero in the same type as 'x'
function numzero(x)
{
    if (typeof(x) == 'number') return 0;
    if (typeof(x) == 'bigint') return 0n;
    console.log(typeof(x)=='object'?x.constructor.name:typeof(x), x);
    throw "unsupported number";
}
// return the number one in the same type as 'x'
function numone(x)
{
    if (typeof(x) == 'number') return 1;
    if (typeof(x) == 'bigint') return 1n;
    console.log(typeof(x)=='object'?x.constructor.name:typeof(x), x);
    throw "unsupported number";
}

// return a primitive integer value, either of type Number, or Bigint
function numval(x)
{
    if (x instanceof Value) { return x.uint(); }
    return x;
} 

// shift right the argument by 1
// returns: the shifted-out bit, and the shifted value.
function numshr(x)
{
    if (x instanceof Value) return x.shr();
    if (typeof(x) == 'number') return [x&1, x>>1];
    if (typeof(x) == 'bigint') return [x&1n, x>>1n];
    console.log(typeof(x)=='object'?x.constructor.name:typeof(x), x);
    throw "unsupported number";
}
// test if a number is zero.
function numiszero(x)
{
    if (typeof(x) == 'number') return x==0;
    if (typeof(x) == 'bigint') return x==0n;
    return x.iszero();
}
// test if two numbers are equal.
function numequals(a, b)
{
    if (typeof(b) != 'object') return a==b;
    return a.equals(b);
}

// convert 'a' to the same type as b.
function cvnum(a, b)
{
    if (typeof(a) == typeof(b)) return a;
    if (typeof(b) == 'bigint') return BigInt(a);
    if (typeof(b) == 'number') return Number(a);
}

// the chinese remainder algorithm, used to calcuate either the gcd, or modular inverse.
function GCD(a,b)
{
    var [prevx, x] = [numone(a), numzero(a)];
    var [prevy, y] = [numzero(a), numone(a)];
    while (b) {
        var r = a%b;
        var q = (a-r)/b;
        [x, prevx] = [prevx - q*x, x];
        [y, prevy] = [prevy - q*y, y];
        [a, b] = [b, r];
    }
    return [a, prevx, prevy];
}
// calculate the greatest common divisor.
function gcd(a,b)
{
    [g, _, _] = GCD(a, b);
    return g;
}
// calculate the least common multiplier.
function lcm(a,b)
{
    return (a*b)/gcd(a,b);
}

// calculate the modular inverse.
function modinv(x, m)
{
    // calculate a,b such that a*x+b*m = g
    var [g, a, b] = GCD(x,m);
    if (a<numzero(a)) return a+m;
    return a;
}

// calculate the modular exponentiation.
function modexp(a, b, m)
{
    // calculate a**b % m
    a %= m;

    var zero = numzero(a);

    if (a<zero)
        a += m;
    if (b<zero)
        return modexp(modinv(a, m), -b, m);

    var bit;
    var r = numone(a);
    while (b) {
        [bit, b] = numshr(b);
        if (bit) {
            r *= a;
            r %= m;
        }
        a *= a;
        a %= m;
    }
    return r % m;
}

