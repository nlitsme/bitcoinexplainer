/* Author: Willem Hengeveld <itsme@xs4all.nl> */
/* https://github.com/nlitsme/bitcoinexplainer */
"use strict";

/*
    This file provides objects which can decode and encode bitcoin transactions
    Each has the following methods:
     * load  - load from a BitcoinReader object.
     * save  - write to a BitcoinWriter object
     * hexdump - return a formatted hexdump of the object.

*/
const opcodetable = {
    0x4f:"1NEGATE",    // -1
    0x50:"RESERVED",   // invalid opcode

    // control
    0x61:"NOP",        // ignored
    0x62:"VER",        // invalid opcode
    0x63:"IF",         // (bool) IF ... ELSE ... ENDIF
    0x64:"NOTIF",      // (bool) NOTIF ... ELSE ... ENDIF
    0x65:"VERIF",      // invalid script
    0x66:"VERNOTIF",   // invalid script
    0x67:"ELSE",       // if.else.endif
    0x68:"ENDIF",      // if.else.endif
    0x69:"VERIFY",     // (bool) VERIFY  --> fail script when false.
    0x6a:"RETURN",     // fail script

    // stack ops
    0x6b:"TOALTSTACK",      // (value) TOALTSTACK  ; --> ()
    0x6c:"FROMALTSTACK",    // FROMALTSTACK      ; --> (value)
    0x6d:"2DROP",      // (a b)  -->  ()
    0x6e:"2DUP",       // (a b)  -->  (a b a b)
    0x6f:"3DUP",       // (a b c)  -->  (a b c a b c)
    0x70:"2OVER",      // (a b c d) --> (a b c d a b)
    0x71:"2ROT",       // (a b c d e f) --> (c d e f a b)
    0x72:"2SWAP",      // (a b c d) --> (c d a b)
    0x73:"IFDUP",      // (0) --> (0)  ;  (a) --> (a a), when a!=0
    0x74:"DEPTH",      // () --> (#)
    0x75:"DROP",       // (x) --> ()
    0x76:"DUP",        // (x) --> (x x)
    0x77:"NIP",        // (a b) --> (b)
    0x78:"OVER",       // (a b) --> (a b a)
    0x79:"PICK",       // (xn..x0, n) --> (xn..x0, xn)
    0x7a:"ROLL",       // (xn..x0, n) --> (..x0, xn)
    0x7b:"ROT",        // (a b c) --> (b c a)
    0x7c:"SWAP",       // (a b) --> (b a)
    0x7d:"TUCK",       // (a b) --> (b a b)

    // splice ops
    0x7e:"CAT",        // disabled (CVE-2010-5137).
    0x7f:"SUBSTR",     // disabled (CVE-2010-5137).
    0x80:"LEFT",       // disabled (CVE-2010-5137).
    0x81:"RIGHT",      // disabled (CVE-2010-5137).
    0x82:"SIZE",       // (x) --> (x len(x))

    // bit logic
    0x83:"INVERT",     // disabled (CVE-2010-5137).
    0x84:"AND",        // disabled (CVE-2010-5137).
    0x85:"OR",         // disabled (CVE-2010-5137).
    0x86:"XOR",        // disabled (CVE-2010-5137).
    0x87:"EQUAL",      // (a b) -->  (EQUAL(a,b))      -- string compare
    0x88:"EQUALVERIFY",// (a b) -->  fail if false
    0x89:"RESERVED1",
    0x8a:"RESERVED2",

    // numeric
    0x8b:"1ADD",      // (a) --> (a+1)
    0x8c:"1SUB",      // (a) --> (a-1)
    0x8d:"2MUL",      // disabled (CVE-2010-5137).
    0x8e:"2DIV",      // disabled (CVE-2010-5137).
    0x8f:"NEGATE",    // (a) --> (-a)
    0x90:"ABS",       // (a) --> (ABS(a))
    0x91:"NOT",       // (a) --> (a==0)
    0x92:"0NOTEQUAL", // (a) --> (a!=0)

    0x93:"ADD",       // (a b) --> (a+b)
    0x94:"SUB",       // (a b) --> (a-b)
    0x95:"MUL",       // disabled (CVE-2010-5137).
    0x96:"DIV",       // disabled (CVE-2010-5137).
    0x97:"MOD",       // disabled (CVE-2010-5137).
    0x98:"LSHIFT",    // disabled (CVE-2010-5137).
    0x99:"RSHIFT",    // disabled (CVE-2010-5137).

    0x9a:"BOOLAND",         // (a b) --> (a && b)
    0x9b:"BOOLOR",          // (a b) --> (a || b)
    0x9c:"NUMEQUAL",        // (a b) --> (a==b)       .. numeric compare
    0x9d:"NUMEQUALVERIFY",  // (a b) --> fail when unequal
    0x9e:"NUMNOTEQUAL",           // (a b) --> (a!=b)       .. numeric compare
    0x9f:"LESSTHAN",              // (a b) --> (a<b)       .. numeric compare
    0xa0:"GREATERTHAN",           // (a b) --> (a>b)       .. numeric compare
    0xa1:"LESSTHANOREQUAL",       // (a b) --> (a<=b)       .. numeric compare
    0xa2:"GREATERTHANOREQUAL",    // (a b) --> (a>=b)       .. numeric compare
    0xa3:"MIN",                   // (a b) --> (MIN(a,b))
    0xa4:"MAX",                   // (a b) --> (MAX(a,b))

    0xa5:"WITHIN",          // (a lo hi) --> (lo <= a && a < hi)

    // crypto
    0xa6:"RIPEMD160",            // (a) --> (RIPEMD160(a))
    0xa7:"SHA1",                 // (a) --> (SHA1(a))
    0xa8:"SHA256",               // (a) --> (SHA256(a))
    0xa9:"HASH160",              // (a) --> (SHARIP(a))
    0xaa:"HASH256",              // (a) --> (SHASHA(a))
    0xab:"CODESEPARATOR",        // ???
    0xac:"CHECKSIG",             // (sig pubkey) --> (CHECKSIG(sig,pubkey))
    0xad:"CHECKSIGVERIFY",       // (sig pubkey) --> fail if invalid
    0xae:"CHECKMULTISIG",        // (sig..., 0, nrsig, pub..., nrpub) --> (CHECKMULTISIG(...))
    0xaf:"CHECKMULTISIGVERIFY",  // (sig..., 0, nrsig, pub..., nrpub) --> fail if sig invalid.

    // expansion
    0xb0:"NOP1",         // ignored
    0xb1:"CHECKLOCKTIMEVERIFY",      // (locktime) CHECKLOCKTIME, VERIFY
    0xb2:"CHECKSEQUENCEVERIFY",      // (sequence) CHECKSEQUENCE, VERIFY
    0xb3:"NOP4",         // ignored
    0xb4:"NOP5",         // ignored
    0xb5:"NOP6",         // ignored
    0xb6:"NOP7",         // ignored
    0xb7:"NOP8",         // ignored
    0xb8:"NOP9",         // ignored
    0xb9:"NOP10",        // ignored

    // Opcode added by BIP 342 (Tapscript)
    0xba:"CHECKSIGADD",  // (sig num pubkey) --> (num+CHECKSIG(sig, pubkey))
}
function opcodename(b)
{
    if (b in opcodetable)
        return opcodetable[b];
}
function annotatePubkey(bytes)
{
    var txt = `<pubkey>`;

    txt += `<signbyte>${bytestohex(bytes.slice(0, 1))}</signbyte>`;
    txt += `<xcoord>${bytestohex(bytes.slice(1, 33))}</xcoord>`;
    if (bytes.length==65)
        txt += `<ycoord>${bytestohex(bytes.slice(33, 65))}</ycoord>`;

    txt += `</pubkey>`;

    return txt;
}
function annotateSignature(bytes)
{
    // 30 4x 02 rr .... 02    ss   .......  ht
    // +0 +1 +2 +3 +4   4+rr  5+rr 6+rr     6+rr+ss
    let rlen = bytes[3];
    let slen = bytes[5+rlen];

    var txt = `<signature>`;
    txt += `<asn1>`;
    txt += `<der tag="SEQtag">${bytestohex(bytes.slice(0,1))}</der>`;
    txt += `<der tag="SEQlen">${bytestohex(bytes.slice(1,2))}</der>`;
    txt += `<der tag="INTtag">${bytestohex(bytes.slice(2,3))}</der>`;
    txt += `<der tag="INTlen">${bytestohex(bytes.slice(3,4))}</der>`;
    txt += `<rvalue>${bytestohex(bytes.slice(4, 4+rlen))}</rvalue>`;
    txt += `<der tag="INTtag">${bytestohex(bytes.slice(4+rlen,5+rlen))}</der>`;
    txt += `<der tag="INTlen">${bytestohex(bytes.slice(5+rlen,6+rlen))}</der>`;
    txt += `<svalue>${bytestohex(bytes.slice(6+rlen, 6+rlen+slen))}</svalue>`;
    txt += `</asn1>`;
    txt += `<hashtype>${bytestohex(bytes.slice(6+rlen+slen))}</hashtype>`;
    txt += `</signature>`;

    return txt;
}
function annotateScript(bytes, tag)
{
    try {
        var txt = `<script tag="${tag}">`;
        var rd = new BitcoinReader(bytes);
        while (rd.have(1)) {
            let p0 = rd.o;
            let b = rd.read8();
            if (b==0) {
                txt += `<smallint value="0">00</smallint>`;
            }
            else if (b<79) {
                var n;
                switch(b) {
                    case 76: rd.require(1); n = rd.read8(); break;
                    case 77: rd.require(2); n = rd.read16(); break;
                    case 78: rd.require(4); n = rd.read32(); break;
                    default: n = b;
                }
                txt += `<pushlen value="${n}">${bytestohex(rd.since(p0))}</pushlen>`;
                rd.require(n);
                var data = rd.readbytes(n);
                txt += annotateValue(data, tag=="in" && rd.eof());
            }
            else if (b!=0x50 && b<=96) {
                txt += `<smallint value="${b-80}">${bytestohex(rd.since(p0))}</smallint>`;
            }
            else {
                let name = opcodename(b);
                if (name)
                    txt += `<opcode name="${opcodename(b)}">${bytestohex(rd.since(p0))}</opcode>`;
                else
                    txt += `<invalid>${bytestohex(rd.since(p0))}</invalid>`;
            }
        }
        txt += `</script>`;

        return txt;
    }
    catch(e)
    {
        return `<invalidscript err="${e}">${bytestohex(bytes)}</invalidscript>`;
    }
}
function annotateValue(bytes, islast)
{
    if (bytes.length==0) {
        return `<null/>`;
    }
    else if (bytes.length==33 && (bytes[0]==2 || bytes[0]==3)) {
        // is comp pubkey
        return annotatePubkey(bytes);
    }
    else if (bytes.length==65 && bytes[0]==4) {
        // is full pubkey
        return annotatePubkey(bytes);
    }
    else if (bytes.length==32) {
        return `<sha256>${bytestohex(bytes)}</sha256>`;
    }
    else if (bytes.length==20) {
        return `<sharip>${bytestohex(bytes)}</sharip>`;
    }
    else if (bytes.length>10 && bytes[0]==0x30 && bytes[2]==2 && bytes[1]==bytes.length-3) {
        // is signature
        return annotateSignature(bytes);
    }
    if (islast)
        return annotateScript(bytes, "p2sh");
    return `<unknownvalue>${bytestohex(bytes)}</unknownvalue>`;
}

// this represents a single bitcoin input.
class Input {
    constructor(rd) { this.load(rd); }
    load(rd)
    {
        this.source = rd.readbytes(32);
        this.index = rd.read32();
        var size = rd.readvar();
        this.scriptdata = rd.readbytes(size);
        this.sequencenr = rd.read32();
    }
    save(wr)
    {
        wr.writebytes(this.source);
        wr.write32(this.index);
        wr.writevar(this.scriptdata.length);
        wr.writebytes(this.scriptdata);
        wr.write32(this.sequencenr);
    }
    hexstring()
    {
        var hex = "";

        var w = new BitcoinWriter();
        w.writebytes(this.source);
        hex += bytestohex(w.result());
        w.reset();
        w.write32(this.index);
        hex += " " + bytestohex(w.result());

        w.reset();
        w.writevar(this.scriptdata.length);
        w.writebytes(this.scriptdata);
        hex += " " + bytestohex(w.result());

        w.reset();
        w.write32(this.sequencenr);
        hex += " " + bytestohex(w.result());

        return hex;
    }
    annotate(i)
    {
        var txt = `<input index="${i}">`;

        txt += `<txnid value="${bytestohex(this.source.slice().reverse())}">${bytestohex(this.source)}</txnid>`;

        var w = new BitcoinWriter();
        w.write32(this.index);
        txt += `<outindex value="${this.index}">${bytestohex(w.result())}</outindex>`;

        w.reset();
        w.writevar(this.scriptdata.length);
        txt += `<varlen tag="scriptsize" value="${this.scriptdata.length}">${bytestohex(w.result())}</varlen>`;
        // the input script is also known as: 'scriptSig'
        if (this.index==-1)
            txt += `<coinbase>${bytestohex(this.scriptdata)}</coinbase>`;
        else
            txt += annotateScript(this.scriptdata, "in");

        w.reset();
        w.write32(this.sequencenr);
        txt +=  `<seqnr value="${this.sequencenr}">${bytestohex(w.result())}</seqnr>`;

        txt += `</input>`;

        return txt;
    }
};

// this represents a single witness for an input.
class Witness {
    constructor(rd) { this.load(rd); }
    load(rd)
    {
        var n = rd.readvar();
        this.items = [];
        for (var i=0 ; i<n ; i++)
        {
            var size = rd.readvar();
            this.items.push(rd.readbytes(size));
        }
    }
    save(wr)
    {
        wr.writevar(this.items.length);
        this.items.forEach( o => { wr.writevar(o.length); wr.writebytes(o); } );
    }
    hexdump(i)
    {
        var lines = [];

        var w = new BitcoinWriter();
        w.writevar(this.items.length);
        lines.push([bytestohex(w.result()), "-- witness #"+i.toString(10)]);
        this.items.forEach( o => {
            var w = new BitcoinWriter();
            w.writevar(o.length); w.writebytes(o);
            lines.push(["\t", bytestohex(w.result())]);
        } );

        return lines;
    }
    annotate(i)
    {
        var txt = `<witness index="${i}">`;

        var w = new BitcoinWriter();
        w.writevar(this.items.length);
        txt += `<varlen tag="nrval" value="${this.items.length}">${bytestohex(w.result())}</varlen>`;

        this.items.forEach( (wval, j) => {
            var w = new BitcoinWriter();
            w.writevar(wval.length);
            txt += `<varlen tag="wvalsize" value="${wval.length}">${bytestohex(w.result())}</varlen>`;
            txt += annotateValue(wval, j==this.items.length-1);
        } );

        txt += `</witness>`;

        return txt;
    }
};

// this represents a single output.
class Output {
    constructor(rd) { this.load(rd); }
    load(rd)
    {
        this.value = rd.read64();
        var size = rd.readvar();
        this.scriptdata = rd.readbytes(size);
    }
    save(wr)
    {
        wr.write64(this.value);
        wr.writevar(this.scriptdata.length);
        wr.writebytes(this.scriptdata);
    }
    hexstring()
    {
        var hex = "";

        var w = new BitcoinWriter();
        w.write64(this.value);
        hex += bytestohex(w.result());
        w.reset();

        hex += " ";

        w.writevar(this.scriptdata.length);
        w.writebytes(this.scriptdata);
        hex += bytestohex(w.result());

        return hex;
    }
    annotate(i)
    {
        var txt = `<output index="${i}">`;

        var w = new BitcoinWriter();
        w.write64(this.value);
        txt += `<btcvalue value="${this.value}">${bytestohex(w.result())}</btcvalue>`;

        w.reset();
        w.writevar(this.scriptdata.length);
        txt += `<varlen tag="scriptsize" value="${this.scriptdata.length}">${bytestohex(w.result())}</varlen>`;
        // the output script is also known as: scriptPubKey
        txt += annotateScript(this.scriptdata, "out");

        txt += `</output>`;

        return txt;
    }

};

// this represents a complete bitcoin transaction.
class Transaction {
    constructor(rd) { this.load(rd); }
    load(rd)
    {
        this.version = rd.read32();
        this.witness = undefined;
        this.witnessflag = 0
        var nrin = rd.readvar();
        if (nrin==0) {
            this.witness = [];
            this.witnessflag = rd.read8();

            nrin = rd.readvar();
        }
        this.inputs = [];
        for (var i=0 ; i<nrin ; i++)
            this.inputs.push(new Input(rd));
        var nrout = rd.readvar();
        this.outputs = [];
        for (var i=0 ; i<nrout ; i++)
            this.outputs.push(new Output(rd));

        if (this.witnessflag) {
            for (var i=0 ; i<nrin ; i++)
                this.witness.push(new Witness(rd));
        }
        this.locktime = rd.read32();
    }
    save(wr)
    {
        wr.write32(this.version);
        if (this.witnessflag) {
            wr.write8(0);
            wr.write8(this.witnessflag);
        }
        wr.writevar(this.inputs.length);
        this.inputs.forEach( i => i.save(wr) );
        wr.writevar(this.outputs.length);
        this.outputs.forEach( i => i.save(wr) );
        if (this.witnessflag) {
            this.witness.forEach( i => i.save(wr) );
        }
        wr.write32(this.locktime);
    }
    hexdump()
    {
        var lines = [];
        var line = "";
        var w = new BitcoinWriter();
        w.write32(this.version);
        line += bytestohex(w.result());
        w.reset();
        if (this.witnessflag) {
            w.write8(0);
            w.write8(this.witnessflag);
            line += " " + bytestohex(w.result());
            w.reset();
        }
        lines.push([line, "-- version" + (this.witnessflag?", witnessflag":"")]);

        w.writevar(this.inputs.length);
        lines.push([bytestohex(w.result()), "-- nr inputs"]);
        w.reset();

        this.inputs.forEach( i => {
            lines.push(["\t", i.hexstring()]);
        });
        w.writevar(this.outputs.length);
        lines.push([bytestohex(w.result()), "-- nr outputs"]);
        w.reset();
        this.outputs.forEach( i => {
            lines.push(["\t", i.hexstring()]);
        });
        if (this.witnessflag) {
            lines.push(["-- witnesses"]);
            this.witness.forEach( (wt, i) => {
                lines.push(...wt.hexdump(i));
            });
        }
        w.write32(this.locktime);
        lines.push([bytestohex(w.result()), "-- locktime"]);

        return lines;
    }
    annotate()
    {
        var txt = `<transaction>`;
        var w = new BitcoinWriter();
        w.write32(this.version);
        txt += `<version value="${this.version}">${bytestohex(w.result())}</version>`;
        if (this.witnessflag) {
            w.reset();
            w.write8(0);
            w.write8(this.witnessflag);
            txt += `<witnessflag value="${this.witnessflag}">${bytestohex(w.result())}</witnessflag>`;
        }
        txt += "\n";

        w.reset();
        w.writevar(this.inputs.length);
        txt += `<varlen tag="nrin" value="${this.inputs.length}">${bytestohex(w.result())}</varlen>`;

        txt += `<inputs>`;
        this.inputs.forEach( (inp, i) => { txt += inp.annotate(i) + "\n"; });
        txt += `</inputs>`;

        w.reset();
        w.writevar(this.outputs.length);
        txt += `<varlen tag="nrout" value="${this.outputs.length}">${bytestohex(w.result())}</varlen>`;
        txt += `<outputs>`;
        this.outputs.forEach( (out, i) => { txt += out.annotate(i) + "\n"; });
        txt += `</outputs>`;
        if (this.witnessflag) {
            txt += `<segwit>`;
            this.witness.forEach( (wt, i) => { txt += wt.annotate(i) + "\n"; });
            txt += `</segwit>`;
        }
        w.reset();
        w.write32(this.locktime);
        txt += `<locktime value="${this.locktime}">${bytestohex(w.result())}</locktime>`;

        txt += `</transaction>`;

        return txt;

    }
};
