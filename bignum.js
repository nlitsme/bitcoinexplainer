function numzero(x)
{
    if (typeof(x) == 'number') return 0;
    if (typeof(x) == 'bigint') return 0n;
    console.log(typeof(x)=='object'?x.constructor.name:typeof(x), x);
    throw "unsupported number";
}
function numone(x)
{
    if (typeof(x) == 'number') return 1;
    if (typeof(x) == 'bigint') return 1n;
    console.log(typeof(x)=='object'?x.constructor.name:typeof(x), x);
    throw "unsupported number";
}
function numval(x)
{
    if (x instanceof Value) { return x.int(); }
    return x;
} 
function numshr(x)
{
    if (x instanceof Value) return x.shr();
    if (typeof(x) == 'number') return [x&1, x>>1];
    if (typeof(x) == 'bigint') return [x&1n, x>>1n];
    console.log(typeof(x)=='object'?x.constructor.name:typeof(x), x);
    throw "unsupported number";
}
function numiszero(x)
{
    if (typeof(x) == 'number') return x==0;
    if (typeof(x) == 'bigint') return x==0n;
    return x.iszero();
}
function numequals(a, b)
{
    if (typeof(b) != 'object') return a==b;
    return a.equals(b);
}

function cvnum(a, b)
{
    if (typeof(a) == typeof(b)) return a;
    if (typeof(b) == 'bigint') return BigInt(a);
    if (typeof(b) == 'number') return Number(a);
}


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
function gcd(a,b)
{
    [g, _, _] = GCD(a, b);
    return g;
}
function lcm(a,b)
{
    return (a*b)/gcd(a,b);
}
function modinv(x, m)
{
    // calculate a,b such that a*x+b*m = g
    var [g, a, b] = GCD(x,m);
    if (a<numzero(a)) return a+m;
    return a;
}

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
        if (bit)
            r *= a;
        a *= a;  a %= m;
    }
    return r % m;
}

