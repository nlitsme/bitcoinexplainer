/* Author: Willem Hengeveld <itsme@xs4all.nl> */
/* https://github.com/nlitsme/bitcoinexplainer */
"use strict";

/* generate primes up to 'maxnum' */

function* genprimes(maxnum)
{
    var map = new Array(maxnum/2);
    var p = 2;
    yield p;
    p++;
    while (p<maxnum) {
        if (!map[(p-1)/2]) {
            yield p;
            for (var i=p*p ; i<maxnum ; i+=2*p)
                map[(i-1)/2] = true;
        }
        p+=2;
    }
}
