# Several interactive elliptic curve and bitcoin demonstrations.

 * [curve playground](https://rawcdn.githack.com/nlitsme/bitcoinexplainer/aa50e86e8c72c04a7986f5f7c43bc2f98df94107/curve.html)
 * [various ECDSA calculations](https://rawcdn.githack.com/nlitsme/bitcoinexplainer/aa50e86e8c72c04a7986f5f7c43bc2f98df94107/ecdsacrack.html)
    * demonstrate calculation of a publickey, also how to crack a key given a re-used signing secret.
 * [calculator](https://rawcdn.githack.com/nlitsme/bitcoinexplainer/aa50e86e8c72c04a7986f5f7c43bc2f98df94107/calculator.html) - a free form expression calculator.
 * [decode transactions](https://rawcdn.githack.com/nlitsme/bitcoinexplainer/aa50e86e8c72c04a7986f5f7c43bc2f98df94107/transaction.html)
 * [run tests](https://rawcdn.githack.com/nlitsme/bitcoinexplainer/aa50e86e8c72c04a7986f5f7c43bc2f98df94107/unittest.html) - used while developing, shows how the code is intended to be used.


Note that the javascript code works with both small integers and javascript's bigint numbers.

My elliptic curve implementations is intended to be readable, no attempt was made to make this
cryptographically safe.

The calculations are performed by your browser, no data is sent to a server.


# todo

 * addressconverter
 * message hash calculation


# AUTHOR

Willem Hengeveld <itsme@xs4all.nl>

