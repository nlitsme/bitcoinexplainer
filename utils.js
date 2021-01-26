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

var nr_checked = 0;
var nr_failed = 0;

function CHECK(desc, a, b)
{
    nr_checked++;

    if (typeof(a) == "undefined")
    {
        console.log(desc);
        return;
    }
    if (typeof(b) == "undefined")
    {
        if (!a) {
            console.log(desc, ":", a, "== false");
            nr_failed++;
        }
        return;
    }
    if (typeof(a) != typeof(b))
    {
        console.log(desc, ":", typeof(a), "!=", typeof(b));
        nr_failed++;
        return;
    }
    if (typeof(a)=="object")
    {
        if (!a.equals(b)) {
            console.log(desc, ":", a, "!=", b);
            nr_failed++;
        }
        return;
    }
    if (a!=b) {
        console.log(desc, ":", a, "!=", b);
        nr_failed++;
    }
}
function STATS()
{
    console.log("total tests: ", nr_checked, ", ", nr_failed, " failed.");
}
