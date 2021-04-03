/* an expression parser */


class NumValue  {
    constructor(value) { this.value = value; }
    toString() { return "NUM:["+this.value+"]"; }
};
class Name  {
    constructor(name) { this.name = name; }
    toString() { return "NAME:["+this.name+"]"; }
};
class Operator  {
    constructor(op) { this.op = op; this.args = []; }
    toString() { return "OP:["+this.op+":"+this.args.join(", ")+"]"; }
    precedence()
    {
        if (this.op == "+") return 1;
        if (this.op == "-") return 1;
        if (this.op == "*") return 2;
        if (this.op == "/") return 2;
        if (this.op == "^") return 3;
        if (this.op == "**") return 3;
        if (this.op == "=") return 0;
        throw "unsupported operator";
    }
    add(item) { this.args.push(item); }
};
class Bracket {
    constructor(type) { this.type = type; }
    toString() { return "BRACKET:["+this.type+"]"; }
    isopen() { return "[({<".includes(this.type); }
    isclose() { return "])}>".includes(this.type); }
    closes(t) { return ["[]", "()", "{}", "<>"].includes(t.type+this.type); }
};
class Comma {
    toString() { return "COMMA"; }
};
class Whitespace {
    toString() { return "SPACE"; }
};

function* tokenizer(txt)
{
    var p = 0;
    var patterns = [
        [ NumValue,      /0x[0-9a-fA-F]+\b/y ],
        [ NumValue,      /[0-9]+\b/y ],
        [ Name,       /[a-zA-Z_]\w*(?:\.\w+)*/y ],
        [ Operator,   /\*\*|[=+*/^]|-/y ],
        [ Bracket,    /[()]/y ],
        [ Comma,      /,/y ],
        [ Whitespace, /\s+/y ],
    ];
    while (p < txt.length)
    {
        var t = null;
        for (var [cls, pattern] of patterns) {
            pattern.lastIndex = p;
            var m = pattern.exec(txt);
            if (m) {
                p = pattern.lastIndex;
                t = new cls(m[0]);
                break;
            }
        }
        if (!t)
            throw "invalid token";
        yield t;
    }
}
class ExpressionList {
    constructor(type, values)
    {
        this.type = type;
        this.values = values;
    }
    toString() { return "EXPR:["+this.type+":"+this.values.join(", ")+"]"; }
};
class Function {
    constructor(name, args)
    {
        this.name = name;
        this.args = args;
    }
    toString() { return "FUNC:["+this.name+":"+this.args.join(", ")+"]"; }
};


function brackets(tokens)
{
    var stack = [];
    var exprlist = [];
    var tokensequence = [];
    for (let t of tokens) {
        if (t instanceof Whitespace)
            continue;
        if (t instanceof Bracket && t.isopen()) {
            stack.push([t, exprlist, tokensequence]);
            exprlist = [];
            tokensequence = [];
        }
        else if (t instanceof Comma) {
            if (stack.length==0)
                throw "comma without bracket";
            exprlist.push(tokensequence);
            tokensequence = [];
        }
        else if (t instanceof Bracket && t.isclose()) {
            exprlist.push(tokensequence);
            closedlist = exprlist;
            [topen, exprlist, tokensequence] = stack.pop();
            if (!t.closes(topen))
                throw "mismatched brackettypes";
            tokensequence.push(new ExpressionList(topen.type+t.type, closedlist));
        }
        else {
            tokensequence.push(t)
        }
    }
    if (stack.length) {
        throw "unclosed brackets";
    }

    if (tokensequence.length) {
        exprlist.push(tokensequence);
        tokensequence = undefined;
    }

    if (exprlist.length==0)
        return [];

    if (exprlist.length>1)
        throw "expected toplevel exprlist to have just one token sequence";
    return exprlist[0];
}

class EmptyList {
    toString() { return "EMPTY[]"; }
};


function parse(tokens)
{
    /* parse a token stream into an expression tree */
    var stack = [];
    for (var t of tokens) {
        if (t instanceof ExpressionList) {
            t.values = t.values.map(s=>parse(s));
            if (stack.length>0 && stack[stack.length-1] instanceof Name)
                t = new Function(stack.pop().name, t.values)
        }
        else if (t instanceof Operator) {
            // [..., +, item] && + < * ==>   [..., *(+(item))]
            while (stack.length>=2 && stack[stack.length-2] instanceof Operator && t.precedence() <= stack[stack.length-2].precedence()) {
                rhs = stack.pop();
                stack[stack.length-1].add(rhs);
            }
            if (stack.length==0)
                throw "unary operators not allowed";
            t.add(stack.pop());
        }

        stack.push(t);
    }

    while (stack.length>=2 && stack[stack.length-2] instanceof Operator) {
        rhs = stack.pop();
        stack[stack.length-1].add(rhs)
    }

    if (stack.length>1)
        throw "too many items on the stack";

    if (stack.length==0)
        return new EmptyList()
    return stack.pop()
}

function parseexpr(txt)
{
    return parse(brackets(tokenizer(txt)));
}


function evaluator(e, ctx)
{
    /* evaluate the expression with the specified context. */
    if (e instanceof Operator) {
        if (e.op == "+") fn = ctx.add;
        else if (e.op == "-") fn = ctx.sub;
        else if (e.op == "*") fn = ctx.mul;
        else if (e.op == "/") fn = ctx.div;
        else if (e.op == "^") fn = ctx.pow;
        else if (e.op == "=") {
            // '=' handles its first argument diffrently, another solution would
            // be to use some kind of reference mechanism, like in c++.
            let [varname, ...rest] = e.args;
            ctx.set(varname.name, ...rest.map(_=>evaluator(_, ctx)));
            return;
        }
        else {
            throw "unknown operator";
        }
        return fn(...e.args.map(_=>evaluator(_, ctx)));
    }
    if (e instanceof Function) {
        fn = ctx[e.name];
        return fn(...e.args.map(_=>evaluator(_, ctx)));
    }
    if (e instanceof Name) 
        return ctx.get(e.name);
    if (e instanceof NumValue) 
        return ctx.numbervalue(e.value);
    if (e instanceof ExpressionList) {
        if (e.values.length==1) 
            return evaluator(e.values[0], ctx);

        // todo, I need a way to propagate a state change in the ctx 
        // when processing values between '()', 
        // example: coordinates in an elliptic curve.
        return ctx.listvalue(e.type, e.values.map(_=>evaluator(_, ctx)));
    }
    if (e instanceof EmptyList)
        return [];
    if (typeof(e) == "array")
        return e.map(_=>evaluator(_, ctx));
    throw "unknown object";
}


