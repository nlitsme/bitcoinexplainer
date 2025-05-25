# Several interactive elliptic curve and bitcoin demonstrations.

 * [curve playground](https://rawcdn.githack.com/nlitsme/bitcoinexplainer/4b9d555b320f95d8912e765013b6f1ce43134289/curve.html)
 * [various ECDSA calculations](https://rawcdn.githack.com/nlitsme/bitcoinexplainer/4b9d555b320f95d8912e765013b6f1ce43134289/ecdsacrack.html)
    * demonstrate calculation of a publickey, also how to crack a key given a re-used signing secret.
 * [using linear algebra](https://rawcdn.githack.com/nlitsme/bitcoinexplainer/4b9d555b320f95d8912e765013b6f1ce43134289/linearequations.html) to crack groups of related keys.
 * [calculator](https://rawcdn.githack.com/nlitsme/bitcoinexplainer/4b9d555b320f95d8912e765013b6f1ce43134289/calculator.html) - a free form expression calculator.
 * [decode transactions](https://rawcdn.githack.com/nlitsme/bitcoinexplainer/4b9d555b320f95d8912e765013b6f1ce43134289/transaction.html)
 * [run tests](https://rawcdn.githack.com/nlitsme/bitcoinexplainer/4b9d555b320f95d8912e765013b6f1ce43134289/unittest.html) - used while developing, shows how the code is intended to be used.


Note that the javascript code works with both small integers and javascript's bigint numbers.

My elliptic curve implementations is intended to be readable, no attempt was made to make this
cryptographically safe.

The calculations are performed by your browser, no data is sent to a server.


# todo

 * addressconverter
 * message hash calculation
 * transaction hash calculation
 * address hash calculation
 * add support for comments to the calculator
 * add real-valued curve for comparison
 * can you calculate the real-valued logarithm?

# AUTHOR

Willem Hengeveld <itsme@xs4all.nl>

