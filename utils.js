/* Author: Willem Hengeveld <itsme@xs4all.nl> */
/* https://github.com/nlitsme/bitcoinexplainer */
"use strict";

// this file contains functions, mostly used by the unittests.

// adding a 'equals' method to all objects.
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}

// the functions below are used by my unittests.

var nr_checked = 0;
var nr_failed = 0;

function CHECK(desc, a, b)
{
    nr_checked++;

    if (typeof(a) == "undefined")
    {
        print(desc);
        return;
    }
    if (typeof(b) == "undefined")
    {
        if (!a) {
            print(desc, ":", a, "== false");
            nr_failed++;
        }
        return;
    }
    if (typeof(a) != typeof(b))
    {
        print(desc, ":", typeof(a), "!=", typeof(b));
        nr_failed++;
        return;
    }
    if (typeof(a)=="object")
    {
        if (!a.equals(b)) {
            print(desc, ":", a, "!=", b);
            nr_failed++;
        }
        return;
    }
    if (a!=b) {
        print(desc, ":", a, "!=", b);
        nr_failed++;
    }
}
function STATS()
{
    print(nr_checked, " tests done, ", nr_failed?nr_failed:"none", " failed.");
}
