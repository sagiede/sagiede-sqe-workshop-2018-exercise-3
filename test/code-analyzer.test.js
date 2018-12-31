import assert from 'assert';
import * as codeAnalyzer from '../src/js/code-analyzer';

describe('general Test', () => {
    const userInput = '1,2,[0,3,0]';
    let funcInput = 'function foo(x, y, z){\n' +
        '\t\t\tlet a = x + 1;\n' +
        '\t\t\tlet b = a + y;\n' +
        '\t\t\tlet c = 0;\n' +
        '\tif( x == 1){\n' +
        '\t   if(z == 2){\n' +
        '\t\t  c = 5;\n' +
        '\t\t  c = 7;\n' +
        '\t   }\n' +
        '\t   else\n' +
        '\t\t  c = 8;\n' +
        '\t}\n' +
        '\tif ( x == 0){\n' +
        '\t   if(y == 1)\n' +
        '\t\t  b = 9;\n' +
        '\t   else\n' +
        '\t\t  b = 8;\n' +
        '\t}\n' +
        'return b;\n' +
        '\t}';
    let expectedOutput1 = 'st=>start\n' +
        'op1=>operation: --1--\n' +
        'let a = x + 1; | isGreen\n' +
        '\n' +
        'op2=>operation: --2--\n' +
        'let b = a + y; | isGreen\n' +
        '\n' +
        'op3=>operation: --3--\n' +
        'let c = 0; | isGreen\n' +
        '\n' +
        'cond4=>condition: --4--\n' +
        'x == 1; | isGreen\n' +
        '\n' +
        'cond5=>condition: --5--\n' +
        'z == 2; | isGreen\n' +
        '\n' +
        'op6=>operation: --6--\n' +
        'c = 5 \n' +
        '\n' +
        'op7=>operation: --7--\n' +
        'c = 7 \n' +
        '\n' +
        'op8=>operation: --8--\n' +
        'c = 8 | isGreen\n' +
        '\n' +
        'cond9=>condition: --9--\n' +
        'x == 0; | isGreen\n' +
        '\n' +
        'cond10=>condition: --10--\n' +
        'y == 1; \n' +
        '\n' +
        'op11=>operation: --11--\n' +
        'b = 9 \n' +
        '\n' +
        'op12=>operation: --12--\n' +
        'b = 8 \n' +
        '\n' +
        'e13=>end: --13--\n' +
        'return b; | isGreen\n' +
        '\n' +
        'st->op1\n' +
        'op1->op2\n' +
        'op2->op3\n' +
        'op3->cond4\n' +
        'op6->op7\n' +
        'cond5(yes)->op6\n' +
        'cond5(no)->op8\n' +
        'cond4(yes)->cond5\n' +
        'cond4(no)->cond9\n' +
        'op7->cond9\n' +
        'op8->cond9\n' +
        'cond10(yes)->op11\n' +
        'cond10(no)->op12\n' +
        'cond9(yes)->cond10\n' +
        'cond9(no)->e13\n' +
        'op11->e13\n' +
        'op12->e13\n';
    it('test1', () => {
        const output = codeAnalyzer.createFlowChart(funcInput, userInput);
        assert.deepEqual(output, expectedOutput1);
    });
    let funcInput2 = '\tfunction foo(x, y, z){\n' +
        '\t\t   let a = x + 1;\n' +
        '\t\t   let b = a + y;\n' +
        '\t\t   let c = 0;\n' +
        '\t   if (b < z) {\n' +
        '\t   while(3>2){\n' +
        '\t  a = a+1;\n' +
        '\t}\n' +
        '\t}\n' +
        '\n' +
        '   return c\n' +
        '  }';
    let expectedOutput2 = 'st=>start\n' +
        'op1=>operation: --1--\n' +
        'let a = x + 1; | isGreen\n' +
        '\n' +
        'op2=>operation: --2--\n' +
        'let b = a + y; | isGreen\n' +
        '\n' +
        'op3=>operation: --3--\n' +
        'let c = 0; | isGreen\n' +
        '\n' +
        'cond4=>condition: --4--\n' +
        'b < z; | isGreen\n' +
        '\n' +
        'cond5=>condition: --5--\n' +
        '3 > 2; \n' +
        '\n' +
        'op6=>operation: --6--\n' +
        'a = a + 1 \n' +
        '\n' +
        'e7=>end: --7--\n' +
        'return c; | isGreen\n' +
        '\n' +
        'st->op1\n' +
        'op1->op2\n' +
        'op2->op3\n' +
        'op3->cond4\n' +
        'cond5(yes)->op6\n' +
        'op6->cond5\n' +
        'cond4(yes)->cond5\n' +
        'cond4(no)->e7\n' +
        'cond5(no)->e7\n';

    it('test2', () => {
        const output2 = codeAnalyzer.createFlowChart(funcInput2, userInput);
        assert.deepEqual(output2, expectedOutput2);
    });

});
//
// describe('simple unary and member tests', () => {
//     const userInput1 = '20';
//     const funcInput1 = 'function foo(x){\n' +
//         '    let a = [x,x+1];\n' +
//         '    a[0] = 1;\n' +
//         '    if(x > 1){\n' +
//         '       return a[0];\n' +
//         '    }\n' +
//         '}';
//     let expecColorMap1 = {};
//     expecColorMap1['NODE-ID:|(X>1)|(FP-'] = true;
//     expecColorMap1['NODE-ID:|A[0]=1|AFP-'] = true;
//     expecColorMap1['NODE-ID:|FUNCTIONFOO(X)|FP-'] = true;
//     expecColorMap1['NODE-ID:|LETA=[X,X+1]|LFP-'] = true;
//     expecColorMap1['NODE-ID:|RETURNA[0]|R(FP-'] = true;
//     it('test1', () => {
//         codeAnalyzer.createFlowChart(funcInput1, userInput1);
//         assert.deepEqual(codeAnalyzer.colorMap, expecColorMap1);
//     });
//
//     const userInput2 = 'true';
//     const funcInput2 = 'function foo(x){\n' +
//         '    let a = true;\n' +
//         '    let b = !a;\n' +
//         '    let c = a & b;\n' +
//         '    return c;\n' +
//         '}';
//     let expecColorMap2 = {};
//     expecColorMap2['NODE-ID:|FUNCTIONFOO(X)|FP-'] = true;
//     expecColorMap2['NODE-ID:|LETA=TRUE|LFP-'] = true;
//     expecColorMap2['NODE-ID:|LETB=!A|LFP-'] = true;
//     expecColorMap2['NODE-ID:|LETC=A&B|LFP-'] = true;
//     expecColorMap2['NODE-ID:|RETURNC|RFP-'] = true;
//     it('test2', () => {
//         codeAnalyzer.createFlowChart(funcInput2, userInput2);
//         assert.deepEqual(codeAnalyzer.colorMap, expecColorMap2);
//     });
//
//     const userInput3 = '';
//     const funcInput3 = 'function foo(){\n' +
//         '    return true;' +
//     '}';
//     let expecColorMap3 = {};
//     expecColorMap3['NODE-ID:|FUNCTIONFOO()|FP-'] = true;
//     expecColorMap3['NODE-ID:|RETURNTRUE|RFP-'] = true;
//     it('test3', () => {
//         codeAnalyzer.createFlowChart(funcInput3, userInput3);
//         assert.deepEqual(codeAnalyzer.colorMap, expecColorMap3);
//     });
//
//     const userInput4 = '0,[1,2,3]';
//     const funcInput4 = 'function foo(x,y){\n' +
//         '    let a;' +
//         '    a = y[x];' +
//         '    y[x] = -1; ' +
//         '    if (a == y[x])' +
//         '       return "hey true";' +
//         '    else' +
//         '       return "hey false";' +
//         '}';
//     let expecColorMap4 = {};
//     expecColorMap4['NODE-ID:|(A==Y[X])|(FP-'] =  true;
//     expecColorMap4['NODE-ID:|A=Y[X]|AFP-'] = true;
//     expecColorMap4['NODE-ID:|FUNCTIONFOO(X,Y)|FP-'] = true;
//     expecColorMap4['NODE-ID:|LETA|LFP-'] = true;
//     expecColorMap4['NODE-ID:|RETURN"HEYFALSE"|R(FP-'] = true;
//     expecColorMap4['NODE-ID:|Y[X]=-1|YFP-'] = true;
//     it('test4', () => {
//         codeAnalyzer.createFlowChart(funcInput4, userInput4);
//         assert.deepEqual(codeAnalyzer.colorMap, expecColorMap4);
//     });
//
//     const userInput5 = '[1],0';
//     const funcInput5 = 'function foo(x,a){\n' +
//         '    return x[a];' +
//         '}';
//     let expecColorMap5 = {};
//     expecColorMap5['NODE-ID:|FUNCTIONFOO(X,A)|FP-'] = true;
//     expecColorMap5['NODE-ID:|RETURNX[A]|RFP-'] = true;
//     it('test5', () => {
//         codeAnalyzer.createFlowChart(funcInput5, userInput5);
//         assert.deepEqual(codeAnalyzer.colorMap, expecColorMap5);
//     });
//
//     const userInput6 = 'true';
//     const funcInput6 = 'function foo(x){\n' +
//         'if (x)\n' +
//         'return "HOLA";\n' +
//         'else\n' +
//         'return "BYE";\n' +
//         '}';
//     let expecColorMap6 = {};
//     expecColorMap6['NODE-ID:|(X)|(FP-'] = true;
//     expecColorMap6['NODE-ID:|FUNCTIONFOO(X)|FP-'] = true;
//     expecColorMap6['NODE-ID:|RETURN"HOLA"|R(FP-'] = true;
//     it('test6', () => {
//         codeAnalyzer.createFlowChart(funcInput6, userInput6);
//         assert.deepEqual(codeAnalyzer.colorMap, expecColorMap6);
//     });
// });