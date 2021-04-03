/* Author: Willem Hengeveld <itsme@xs4all.nl> */
/* https://github.com/nlitsme/bitcoinexplainer */

/* functions reading and writing bitcoin data */

// convert hex to bytearray.
function hextobytes(hex)
{
    var buf = new Uint8Array(hex.length/2);
    for (var i in buf)
        buf[i] = parseInt(hex.substr(i*2, 2), 16);
    return buf;
}
// convert a bytearray to hex.
function bytestohex(buf)
{
    var hex = "";
    for (var b of buf) {
        if (b<16)
            hex += "0";
        hex += b.toString(16);
    }
    return hex;
}

// read bitcoin data from a byte-array.
class BitcoinReader {
    constructor(buf)
    {
        this.buf = buf;
        this.o = 0;
    }
    read8()
    {
        return this.buf[this.o++];
    }

    read16()
    {
        var l = this.read8();
        var h = this.read8();
        return l+(h<<8);
    }

    read32()
    {
        var l = this.read16();
        var h = this.read16();
        return l+(h<<16);
    }
    read64()
    {
        // note that javascript's integers are only 53 bits.
        // so values of over 2 million btc will not be decoded correctly.
        var l = this.read32();
        var h = this.read32();
        return l+(h*2**32);
    }
    readvar()
    {
        var b = this.read8();
        if (b==0xfd) return this.read16();
        if (b==0xfe) return this.read32();
        if (b==0xff) return this.read64();
        return b;
    }
    readbytes(n)
    {
        var data = this.buf.subarray(this.o, this.o+n);
        this.o += n;
        return data;
    }
};

// write bitcoin data to a byte-array.
class BitcoinWriter {
    constructor()
    {
        this.buf = new Uint8Array(4096);
        this.o = 0;
    }
    reset()
    {
        this.o = 0;
    }
    result()
    {
        return this.buf.subarray(0, this.o);
    }
    grow()
    {
        var cur = this.buf;
        this.buf = new Uint8Array(cur.length*2);
        this.buf.set(cur);
    }
    write8(b)
    {
        if (this.o>=this.buf.length)
            this.grow();
        this.buf[this.o++] = b;
    }

    write16(x)
    {
        this.write8(x&255);
        this.write8(x>>8);
    }

    write32(x)
    {
        this.write16(x&0xFFFF);
        this.write16(x>>16);
    }
    write64(x)
    {
        // in javascript this may give a negative result.
        var l = x&0xFFFFFFFF;
        if (l<0) l += 0x100000000;
        this.write32(l);
        // note: right-shift 32 does not work in javascript
        //  (1>>32) == 1
        this.write32(Math.floor(x/2**32));
    }
    writevar(x)
    {
        if (x<0xfd)
            this.write8(x);
        else if (x<0x10000) {
            this.write8(0xfd);
            this.write16(x);
        }
        else if (x<0x100000000) {
            this.write8(0xfe);
            this.write32(x);
        }
        else {
            this.write8(0xff);
            this.write64(x);
        }
    }
    writebytes(data)
    {
        while (this.o+data.length>this.buf.length)
            this.grow();
        this.buf.set(data, this.o);
        this.o += data.length;
    }
};
