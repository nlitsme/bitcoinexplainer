/* Author: Willem Hengeveld <itsme@xs4all.nl> */
/* https://github.com/nlitsme/bitcoinexplainer */

// some functions for helping create html tags.

function el()
{
    // create an html element by tagname, optionally adding children and attributes.
    // arguments of:
    //   - instance 'Element' are added as children,
    //   - type string, are passed to replaceChildren, and converted to text
    //   - objects and Map are treated as attribute lists.

    if (arguments.length==0)
        throw "el needs at least one argument";
    var tag = arguments[0];
    var e = document.createElement(tag);
    var args = [];
    var attr;
    for (var i=1 ; i<arguments.length ; i++)
    {
        var arg = arguments[i];
        if (arg instanceof Element)
            args.push(arg);
        else if (arg instanceof Map)
            arg.forEach( (v,k)=>e.setAttribute(k, v) );
        else if (typeof(arg) == "string")
            args.push(arg);
        else if (typeof(arg) == "object")
            Object.entries(arg).forEach(([k,v])=>e.setAttribute(k, v))
        else
            throw "unsupported el argument";
    }
    if (args)
        e.replaceChildren(...args);
    return e;
}
function makeslider(label, idtag, minvalue, maxvalue, initval, texttoval, valtotext)
{
    // create a slider with label, min/max, value converters.
    var lbl = el('span')
    lbl.innerHTML = label;
    var disp = el('span')
    disp.id = idtag+".value";

    var inp = el('input')
    inp.id = idtag;
    inp.type = "range";
    inp.min = minvalue;
    inp.max = maxvalue;
    inp.value = initval;
    inp.oninput = function() { texttoval(this.value); disp.innerHTML = valtotext(); update(); };
    //inp.style.transform = "rotate(90deg)";
    //inp.style.width = 100;
    //inp.style.height = 100;

    texttoval(inp.value);
    disp.innerHTML = valtotext();

    var div = el('div', {id:idtag+"div"});
    div.append(inp, lbl, disp);
    return div;
}

function decodecsv(txt)
{
    // decode a csv file to an array of objects.
    var table = [];
    var names;
    for (var line of txt.split("\n")) {
        if (!line) continue;
        fields = line.split(",");
        if (!names)
            names = fields;
        else
            table.push(Object.fromEntries(names.map( (name, i)=> [name, fields[i]] )))
    }
    return table;
}

// various formatting functions.

function fmtdate(t)
{
    // format a time as yyyy-mm-dd
    var y = t.getFullYear();
    var m = (t.getMonth()+1).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
    var d = t.getDate().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
    return y+"-"+m+"-"+d;
}
function makedatetd(t)
{
    // create a center aligned table cell with a formatted date
    var td = el('td', fmtdate(t));
    td.style.textAlign = 'center';
    return td;
}

function makenumtd(txt, decimals=0)
{
    // create a right aligned table cell, for numbers mostly,
    // format with the specified number of decimals.
    if (typeof(txt)=="number")
        txt = txt.toFixed(decimals);
    var td = el('td', txt);
    td.style.textAlign = 'right';
    return td;
}


