# Several interactive elliptic curve and bitcoin demonstrations.

 * [curve playground](https://rawcdn.githack.com/nlitsme/bitcoinexplainer/0165c8008266606503b460475dfb1750c2dc6282/curve.html)
 * [various ECDSA calculations](https://rawcdn.githack.com/nlitsme/bitcoinexplainer/0165c8008266606503b460475dfb1750c2dc6282/ecdsacrack.html)
    * demonstrate calculation of a publickey, also how to crack a key given a re-used signing secret.
 * [calculator](https://rawcdn.githack.com/nlitsme/bitcoinexplainer/0165c8008266606503b460475dfb1750c2dc6282/calculator.html) - a free form expression calculator.
 * [decode transactions](https://rawcdn.githack.com/nlitsme/bitcoinexplainer/0165c8008266606503b460475dfb1750c2dc6282/transaction.html)
 * [run tests](https://rawcdn.githack.com/nlitsme/bitcoinexplainer/0165c8008266606503b460475dfb1750c2dc6282/unittest.html) - used while developing, shows how the code is intended to be used.


Note that the javascript code works with both small integers and javascript's bigint numbers.

My elliptic curve implementations is intended to be readable, no attempt was made to make this
cryptographically safe.

The calculations are performed by your browser, no data is sent to a server.


# todo

 * addressconverter
 * message hash calculation


# AUTHOR

Willem Hengeveld <itsme@xs4all.nl>

