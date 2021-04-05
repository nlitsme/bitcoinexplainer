/* Author: Willem Hengeveld <itsme@xs4all.nl> */
/* https://github.com/nlitsme/bitcoinexplainer */
"use strict";

/*
    This file provides objects which can decode and encode bitcoin transactions
    Each has the following methods:
     * load  - load from a BitcoinReader object.
     * save  - write to a BitcoinWriter object
     * hexdump - return a formatted hexdump of the object.


TODO: create an annotated output, tagging each element, making addresses, txnhash clickable.
*/


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
        w.write32(this.index);
        hex += bytestohex(w.result());

        w.reset();
        w.writevar(this.scriptdata.length);
        w.writebytes(this.scriptdata);
        hex += " " + bytestohex(w.result());

        w.reset();
        w.write32(this.sequencenr);
        hex += " " + bytestohex(w.result());

        return hex;
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
        lines.push([line, "- version" + (this.witnessflag?", witnessflag":"")]);

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
};
