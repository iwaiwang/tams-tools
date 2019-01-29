start
  = list:expressions EOF {
    return list;
  }
  / _ EOF {
    return []
  }

labelOperator "labelOperator"
  = "="

noChar = [^0-9A-Za-z_-] / EOF

logicAnd = "and" & noChar
logicOr = "or" & noChar
logicXor = "xor" & noChar
logicNot = "not" & noChar

logicTop = "True" & noChar / "1"
logicBottom = "False" & noChar / "0"
logicUndefined = "None" & noChar

vectorStart = "<"
vectorEnd = ">"

operatorPrec1 "binary operator"
  = logicAnd { return "AND"; }

operatorPrec2
  = logicXor { return "XOR"; }

operatorPrec3 "binary operator"
  = logicOr { return "OR"; }

operatorUnary "unary operator"
  = logicNot { return "NOT"; }

reserved = labelOperator
  / logicAnd
  / logicOr
  / logicXor
  / logicNot
  / logicTop
  / logicBottom
  / logicUndefined
  / vectorStart
  / vectorEnd

identifierName
  = !reserved name:([A-Za-z_][_a-zA-Z0-9]*) {
      return name[0] + name[1].reduce((acc, current) => acc+current, "");
    }

literalValue
  = logicTop { return true; }
  / logicBottom { return false; }
  / logicUndefined { return null; }


vectorHead
  = head:identifier _ tail:(expressionSeparator _ identifier)+ {
    return [head, ...tail.map((t) => t[2])];
  }
  / head:identifier {
    return [head];
  }

vectorValue
  = "1" { return true; }
  / "0" { return false; }
  / "*" { return null; }

vectorBody "vectorBody"
  = values:vectorValue*

literalVector
  = vectorStart _ head:vectorHead _ ":" _ body:vectorBody _ vectorEnd {
    var idCount = head.length;
    var expectedSize = Math.pow(2,idCount);
    if(expectedSize !== body.length) {
      expected("Vector with "+idCount+" identifers to have " + expectedSize + " values.", "x");
    }

    return {
      identifiers: head,
      values: body
    };
  }

parentheses
  = "(" _ body:expression _ ")" {
    return {body: body, style: 1}
  }

expressionSeparator "expression separator"
  = ","

EOF "end of input"
  = !.

_ "whitespace"
  = [ \t\n\r]*

expressions
  = head:labeledExpression _ tail:(expressionSeparator _ labeledExpression)+ {
    return [head, ...tail.map((t) => t[2])];
  }
  / head:labeledExpression {
    return [head];
  }

label "expressionLabel"
  = _ name:identifierName _ {
    return name;
  }

labeledExpression
  = name:label _ labelOperator _ body:expression {
    return {
      location: location(),
      node: 'label',
      name: name,
      body: body,
    };
  }
  / body:expression {
    return {
      location: location(),
      node: 'label',
      name: null,
      body: body,
    };
  }

expression = expressionPrec3

expressionPrec3
  = first:expressionPrec2 _ rest:(operatorPrec3 _ expressionPrec2)+ {
    return rest.reduce(function(memo, curr) {
      return {node: 'binary', operator: curr[0], lhs: memo, rhs: curr[2]};
    }, first);
  }
  / expressionPrec2

expressionPrec2
  = first:expressionPrec1 _ rest:(operatorPrec2 _ expressionPrec1)+ {
    return rest.reduce(function(memo, curr) {
      return {node: 'binary', operator: curr[0], lhs: memo, rhs: curr[2]};
    }, first);
  }
  / expressionPrec1

expressionPrec1
  = first:primary _ rest:(operatorPrec1? _ primary)+ {
    return rest.reduce(function(memo, curr) {
      return {node: 'binary', operator: curr[0] || "AND", lhs: memo, rhs: curr[2]};
    }, first);
  }
  / primary

primary
  = _ lit:literal _ { return lit; }
  / _ group:group _ { return group; }
  / _ un:unary { return un; }
  / _ id:identifier _ { return id; }

group
  = paren:parentheses {
    return {node: 'group', body: paren.body, style: paren.style};
  }

unary
  = op:operatorUnary _ primary:primary {
    return {node: 'unary', operator: op, operand: primary};
  }

identifier "identifier"
  = name:identifierName {
    return {node: 'identifier', name: name}
  }

literal "literal"
  = value:literalValue {
    return {node: 'constant', value: value};
  }
  / vector:literalVector {
    return {node: 'vector', vector: vector};
  }
