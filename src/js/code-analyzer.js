const esprima = require("esprima");
const escodegen = require("escodegen");

let lableIdx = 0;
const Type = {'startObject': 0, 'assignObject': 1, 'ifObject': 3, 'returnObject': 4, 'whileObject': 5};
Object.freeze(Type);
// let startObject = {};           //fields: type:Type ,   nodeName: String ,nodeStr: String
// let assignObject = {};          //fields: type:Type ,   nodeName: String ,nodeStr: String
// let returnObject = {};          //fields: type:Type ,   nodeName: String ,nodeStr: String
// let ifObject = {};   //fields: type:Type ,   nodeName : string , testStr: String ,ditList : List , difList : List
// let whileObject = {}; //fields: type:Type ,   nodeName : string , testStr: String ,ditList : List

let traverseHandler = {};
let typeHandler = {};
let createNodesHandler = {};


function expTraverse(ast, env, isGreen, nodesList, paramsEnv) {
    if (ast) {
        return traverseHandler[ast.type](ast, env, isGreen, nodesList, paramsEnv);
    }
}

const programTraverse = (ast, jsParams, nodesList) => {
    let env = {};
    return functionTraverse(ast.body[0], env, true, nodesList, jsParams);
};

const functionTraverse = (ast, env, isGreen, nodesList, jsParams) => {
    let paramsEnv = {};
    const params = ast.params.reduce((acc, p) => [...acc, p.name], []);
    params.map((p) => {
        return env[p] = p;
    });
    for (let i = 0; i < jsParams.length; i++) {
        if (jsParams[i].length)
            paramsEnv[params[i]] = '[' + jsParams[i].toString() + ']';
        else
            paramsEnv[params[i]] = jsParams[i].toString();
    }
    nodesList = expTraverse(ast.body, env, true, nodesList, paramsEnv);
    return nodesList;
};

const blockTraverse = (ast, env, isGreen, nodesList, paramsEnv) => {
    return ast.body.reduce((nodesList, ast) => {
        nodesList = expTraverse(ast, env, isGreen, nodesList, paramsEnv);
        return nodesList;
    }, nodesList);
};

const substitute = (env, exp) => {
    if (exp.type === ('Identifier')) {
        exp['name'] = env[exp.name];
    }
    else if (exp.type === 'BinaryExpression') {
        exp.left = substitute(env, exp.left);
        exp.right = substitute(env, exp.right);
    }
    else if (exp.type === 'ArrayExpression') {
        exp.elements = exp.elements.map((member) => substitute(env, member));
    }
    else if (exp.type === 'UnaryExpression') {
        exp.argument = substitute(env, exp.argument);
    }
    return substituteMember(env, exp);
};

const substituteMember = (env, exp) => {
    if (exp.type === 'MemberExpression') {
        exp.object = substitute(env, exp.object);
        exp.property = substitute(env, exp.property);
    }
    return exp;
};

const variableDeclTraverse = (ast, env, isGreen, nodesList) => {
    const genCode = escodegen.generate(ast);
    let backUpAst = esprima.parseScript(genCode).body[0];
    const updateEnv = (varDecl) => {
        let val = varDecl.init;
        if (val != undefined) {
            let pref = '';
            let post = '';
            if (val.type === 'BinaryExpression') {
                pref = '(';
                post = ')';
            }
            env[varDecl.id.name] = pref + escodegen.generate(substitute(env, val), {format: {compact: true}}) + post;
        }
        else env[varDecl.id.name] = null;
    };
    ast.declarations.map(updateEnv);
    const node = createNode(backUpAst, Type.assignObject, isGreen);
    return [...nodesList, node];
};

const assignmentExpTraverse = (ast, env, isGreen, nodesList) => {
    let pref = '';
    let post = '';
    if (ast.right.type === 'BinaryExpression') {
        pref = '(';
        post = ')';
    }
    const genCode = escodegen.generate(ast);
    let backUpAst = esprima.parseScript(genCode).body[0].expression;
    extendsEnv(ast.left, pref + escodegen.generate(substitute(env, ast.right)) + post, env);
    const node = createNode(backUpAst, Type.assignObject, isGreen);
    return [...nodesList, node];
};

const whileExpTraverse = (ast, env, isGreen, nodesList, paramsEnv) => {
    let newEnv = Object.assign({}, env);
    const genCode = escodegen.generate(ast.test);
    let backUpTest = esprima.parseScript(genCode).body[0];
    substitute(newEnv, ast.test);
    const isTestTrue = checkTest(ast.test, paramsEnv);
    const whileNode = createNode(backUpTest, Type.whileObject, isGreen);
    whileNode['ditList'] = [];
    whileNode['ditList'] = expTraverse(ast.body, Object.assign({}, newEnv), (isGreen && isTestTrue), whileNode.ditList, paramsEnv);
    return [...nodesList, whileNode];
};

const ifExpTraverse = (ast, env, isGreen, nodesList, paramsEnv) => {

    let newEnv = Object.assign({}, env);
    const genCode = escodegen.generate(ast.test);
    let backUpTest = esprima.parseScript(genCode).body[0];
    substitute(newEnv, ast.test);
    const isTestTrue = checkTest(ast.test, paramsEnv);
    const ifNode = createNode(backUpTest, Type.ifObject, isGreen);
    // const startNode = createNode(backUpTest, Type.startObject, isGreen, ifNode.nodeName);
    ifNode['ditList'] = [];
    ifNode['difList'] = [];
    ifNode['ditList'] = expTraverse(ast.consequent, Object.assign({}, newEnv), (isGreen && isTestTrue), ifNode.ditList, paramsEnv);
    ifNode['difList'] = expTraverse(ast.alternate, Object.assign({}, newEnv), (isGreen && !isTestTrue), ifNode.difList, paramsEnv);
    if (!ifNode['difList'])
        ifNode['difList'] = [];
    return [...nodesList, ifNode];
};

const checkTest = (ast, paramsEnv) => {
    const genCode = escodegen.generate(ast);
    let newAst = esprima.parseScript(genCode);
    newAst = substitute(paramsEnv, newAst.body[0].expression);
    return eval(escodegen.generate(newAst));
};

const returnTraverse = (ast, env, isGreen, nodesList) => {
    const node = createNode(ast, Type.returnObject, isGreen);
    return [...nodesList, node];
};

const genExpTraverse = (ast, env, isGreen, nodesList, paramsEnv) => {
    return expTraverse(ast.expression, env, isGreen, nodesList, paramsEnv);
};

const extendsEnv = (ast, rightSide, env) => {
    if (ast.type === 'Identifier') {
        env[ast.name] = rightSide;
    }
    else {  //ast.type == 'MemberExpression'
        env[escodegen.generate(ast)] = rightSide;
    }
};

const createWhileNode = (ast, type, isGreen) => {
    let green = '';
    let node = {};
    if (isGreen)
        green = '| isGreen';
    lableIdx++;
    const genCode = escodegen.generate(ast);
    node['type'] = type;
    node['nodeName'] = 'cond' + lableIdx;
    node['testStr'] = node['nodeName'] + '=>condition: ' + '--' + lableIdx + '--\n' + genCode + ' ' + green + '\n';
    node['ditList'] = [];
    return node;
};

const createIfNode = (ast, type, isGreen) => {
    let green = '';
    let node = {};
    if (isGreen)
        green = '| isGreen';
    lableIdx++;
    const genCode = escodegen.generate(ast);
    node['type'] = type;
    node['nodeName'] = 'cond' + lableIdx;
    node['testStr'] = node['nodeName'] + '=>condition: ' + '--' + lableIdx + '--\n' + genCode + ' ' + green + '\n';
    node['ditList'] = [];
    node['difList'] = [];
    return node;
};

const createAssignNode = (ast, type, isGreen) => {
    let green = '';
    let node = {};
    if (isGreen)
        green = '| isGreen';
    lableIdx++;
    const genCode = escodegen.generate(ast);
    node['type'] = type;
    node['nodeName'] = 'op' + lableIdx;
    node['nodeStr'] = node['nodeName'] + '=>operation: ' + '--' + lableIdx + '--\n' + genCode + ' ' + green + '\n';
    return node;
};


const createReturnNode = (ast, type, isGreen) => {
    let green = '';
    let node = {};
    if (isGreen)
        green = '| isGreen';
    lableIdx++;
    const genCode = escodegen.generate(ast);
    node['type'] = type;
    node['nodeName'] = 'e' + lableIdx;
    node['nodeStr'] = node['nodeName'] + '=>end: ' + '--' + lableIdx + '--\n' + genCode + ' ' + green + '\n';
    return node;
};


const createStartNode = (ast, type, isGreen, lastNodeName) => {
    let node = {};
    node['type'] = type;
    node['nodeName'] = lastNodeName;
    node['nodeStr'] = 'startNode - not should be Printed';
    return node;
};

const createNode = (ast, type, isGreen, lastNodeName) => {
    return createNodesHandler[type](ast, type, isGreen, lastNodeName);
};
const initTraverseHandler = () => {
    traverseHandler['FunctionDeclaration'] = functionTraverse;
    traverseHandler['WhileStatement'] = whileExpTraverse;
    traverseHandler['IfStatement'] = ifExpTraverse;
    traverseHandler['VariableDeclaration'] = variableDeclTraverse;
    traverseHandler['ReturnStatement'] = returnTraverse;
    traverseHandler['ExpressionStatement'] = genExpTraverse;
    traverseHandler['AssignmentExpression'] = assignmentExpTraverse;
    traverseHandler['BlockStatement'] = blockTraverse;
};

const initTypeHandlers = () => {
    typeHandler[Type.startObject] = printstartObject;
    typeHandler[Type.assignObject] = printAssignObject;
    typeHandler[Type.returnObject] = printReturnObject;
    typeHandler[Type.ifObject] = printifObject;
    typeHandler[Type.whileObject] = printWhileObject;

};

const initCreateNodesHandlers = () => {
    createNodesHandler[Type.startObject] = createStartNode;
    createNodesHandler[Type.assignObject] = createAssignNode;
    createNodesHandler[Type.returnObject] = createReturnNode;
    createNodesHandler[Type.ifObject] = createIfNode;
    createNodesHandler[Type.whileObject] = createWhileNode;
};

function createEdge(fromNode, toNode, cond) {
    if (cond === '') {
        if (fromNode.type === Type.whileObject)
            return fromNode.nodeName + '(no)' + '->' + toNode.nodeName + '\n';
        return fromNode.nodeName + '->' + toNode.nodeName + '\n';
    }
    else
        return fromNode.nodeName + '(' + cond + ')' + '->' + toNode.nodeName + '\n';
}

function printNodesAndEdges(nodesList, diagramString, isFirstTraverse) {
    for (let i = 0; i < nodesList.length; i++) {
        diagramString = typeHandler[nodesList[i].type](i, nodesList, diagramString, isFirstTraverse);
    }
    return diagramString;
}

function printstartObject(i, nodesList, diagramString, isFirstTraverse) {
    if (i < nodesList.length - 1 && (!isFirstTraverse)) {
        const selfNode = nodesList[i];
        const nextNode = nodesList[i + 1];
        diagramString = diagramString + createEdge(selfNode, nextNode, '');
    }
    return diagramString;
}

function printAssignObject(i, nodesList, diagramString, isFirstTraverse) {
    const selfNode = nodesList[i];
    if (isFirstTraverse)
        diagramString += selfNode.nodeStr + '\n';
    else {
        if (i < nodesList.length - 1) {
            const nextNode = nodesList[i + 1];
            diagramString += createEdge(selfNode, nextNode, '');
        }
    }
    return diagramString;
}

function printReturnObject(i, nodesList, diagramString, isFirstTraverse) {
    if (isFirstTraverse) {
        const selfNode = nodesList[i];
        diagramString += selfNode.nodeStr + '\n';
    }
    return diagramString;
}

function getEndPoints(selfNode) {
    if (selfNode != null) {
        if (selfNode.type === Type.ifObject) {
            const ditLastNode = selfNode.ditList[selfNode.ditList.length - 1];
            let difLastNode = null;
            if (selfNode.difList.length > 0)
                difLastNode = selfNode.difList[selfNode.difList.length - 1];
            return [...getEndPoints(ditLastNode), ...getEndPoints(difLastNode)];
        }
        return [selfNode];
    }
    return [];
}

function addDitDifEdgesCont(i, nodesList, diagramString) {
    const selfNode = nodesList[i];
    const hasDit = selfNode.ditList.length > 0;
    const hasDif = selfNode.difList.length > 0;
    if (i < nodesList.length - 1) {
        const nextNode = nodesList[i + 1];
        if (!hasDit)
            diagramString += createEdge(selfNode, nextNode, 'yes');
        if (!hasDif)
            diagramString += createEdge(selfNode, nextNode, 'no');
    }
    return diagramString;
}

function addDitDifEdges(i, nodesList, diagramString) {
    const selfNode = nodesList[i];
    const hasDit = selfNode.ditList.length > 0;
    const hasDif = selfNode.difList.length > 0;
    if (hasDit)
        diagramString += createEdge(selfNode, selfNode.ditList[0], 'yes');
    if (hasDif)
        diagramString += createEdge(selfNode, selfNode.difList[0], 'no');
    return addDitDifEdgesCont(i, nodesList, diagramString);
}

function printifObject(i, nodesList, diagramString, isFirstTraverse) {
    const selfNode = nodesList[i];
    if (isFirstTraverse)
        diagramString += selfNode.testStr + '\n';
    diagramString = printNodesAndEdges(selfNode.ditList, diagramString, isFirstTraverse);
    diagramString = printNodesAndEdges(selfNode.difList, diagramString, isFirstTraverse);
    if (!isFirstTraverse) {
        diagramString = addDitDifEdges(i, nodesList, diagramString);
        if (i < nodesList.length - 1) {
            const nextNode = nodesList[i + 1];
            const ifEndPoints = getEndPoints(selfNode);
            ifEndPoints.map((node) => {
                diagramString += createEdge(node, nextNode, '');
            });
        }
    }
    return diagramString;
}

function printWhileObjectFirstTraverse(i, nodesList, diagramString) {
    const selfNode = nodesList[i];
    diagramString += selfNode.testStr + '\n';
    diagramString = printNodesAndEdges(selfNode.ditList, diagramString, true);
    return diagramString;
}

function printWhileObjectNotFirstTraverse(i, nodesList, diagramString) {
    const selfNode = nodesList[i];
    diagramString = printNodesAndEdges(selfNode.ditList, diagramString, false);
    const hasDit = selfNode.ditList.length > 0;
    if (hasDit) {
        diagramString += createEdge(selfNode, selfNode.ditList[0], 'yes');
        const whileEndPoints = getEndPoints(selfNode.ditList[selfNode.ditList.length - 1]);
        whileEndPoints.map((node) => {
            diagramString += createEdge(node, selfNode, '');
        });
    }
    if (i < nodesList.length - 1) {
        const nextNode = nodesList[i + 1];
        diagramString += createEdge(selfNode, nextNode, 'no');
    }
    return diagramString;
}


function printWhileObject(i, nodesList, diagramString, isFirstTraverse) {
    if (isFirstTraverse)
        return printWhileObjectFirstTraverse(i, nodesList, diagramString);
    else
        return printWhileObjectNotFirstTraverse(i, nodesList, diagramString);
}

// let startObject = {};           //fields: type:Type ,   nodeName: String ,nodeStr: String
// let assignObject = {};          //fields: type:Type ,   nodeName: String ,nodeStr: String
// let returnObject = {};          //fields: type:Type ,   nodeName: String ,nodeStr: String
// let ifObject = {};   //fields: type:Type ,   nodeName : string , testStr: String ,ditList : List , difList : List

function parseCode(funcInput, jsParams, nodesList) {
    nodesList = programTraverse(funcInput, jsParams, nodesList);
    nodesList = [createNode(null, Type.startObject, true, 'st'), ...nodesList];
    let diagramString = 'st=>start\n';
    const firstTraverse = true;
    diagramString = printNodesAndEdges(nodesList, diagramString, firstTraverse);
    diagramString = printNodesAndEdges(nodesList, diagramString, !firstTraverse);
    return diagramString;
}

function createFlowChart(codeToParse, userParams) {
    let funcInput = esprima.parseScript(codeToParse);
    const jsParams = eval('[' + userParams + ']');
    initTraverseHandler();
    initTypeHandlers();
    initCreateNodesHandlers();
    lableIdx = 0;
    let nodesList = [];
    return parseCode(funcInput, jsParams, nodesList);
}


export {createFlowChart};
