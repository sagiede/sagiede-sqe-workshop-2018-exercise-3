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

    let userInput3 = '[1],2,3'
    let funcInput3 = 'function foo(x, y, z){\n' +
        '    let a = x[0] + 1;\n' +
        '    let b = a + y;\n' +
        '    let c = 0;\n' +
        '    \n' +
        '    if (b < z) {\n' +
        '        x[0] = 9;\n' +
        '    } else if (b < z * 2) {\n' +
        '        c = c + x[0] + 5;\n' +
        '    } else \n' +
        '        c = c + z + 5;\n' +
        '    return c;\n' +
        '}\n';
    let expectedOutput3 = 'st=>start\n' +
        'op1=>operation: --1--\n' +
        'let a = x[0] + 1; | isGreen\n' +
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
        'op5=>operation: --5--\n' +
        'x[0] = 9 \n' +
        '\n' +
        'cond6=>condition: --6--\n' +
        'b < z * 2; | isGreen\n' +
        '\n' +
        'op7=>operation: --7--\n' +
        'c = c + x[0] + 5 | isGreen\n' +
        '\n' +
        'op8=>operation: --8--\n' +
        'c = c + z + 5 \n' +
        '\n' +
        'e9=>end: --9--\n' +
        'return c; | isGreen\n' +
        '\n' +
        'st->op1\n' +
        'op1->op2\n' +
        'op2->op3\n' +
        'op3->cond4\n' +
        'cond6(yes)->op7\n' +
        'cond6(no)->op8\n' +
        'cond4(yes)->op5\n' +
        'cond4(no)->cond6\n' +
        'op5->e9\n' +
        'op7->e9\n' +
        'op8->e9\n';

    it('test3 - members check', () => {
        const output3 = codeAnalyzer.createFlowChart(funcInput3, userInput3);
        assert.deepEqual(output3, expectedOutput3);
    });

    const userInput4 = 'true';
    const funcInput4 = 'function foo(x){\n' +
        '    let a = true;\n' +
        '    let b = !a;\n' +
        '    let c = a & b;\n' +
        '    if(c)\n' +
        '       return c;\n' +
        '}\n';

    const expectedOutput4 = 'st=>start\n' +
        'op1=>operation: --1--\n' +
        'let a = true; | isGreen\n' +
        '\n' +
        'op2=>operation: --2--\n' +
        'let b = !a; | isGreen\n' +
        '\n' +
        'op3=>operation: --3--\n' +
        'let c = a & b; | isGreen\n' +
        '\n' +
        'cond4=>condition: --4--\n' +
        'c; | isGreen\n' +
        '\n' +
        'e5=>end: --5--\n' +
        'return c; \n' +
        '\n' +
        'st->op1\n' +
        'op1->op2\n' +
        'op2->op3\n' +
        'op3->cond4\n' +
        'cond4(yes)->e5\n';

    it('test4 - unary and binary exp', () => {
        const output4 = codeAnalyzer.createFlowChart(funcInput4, userInput4);
        assert.deepEqual(output4, expectedOutput4);
    });

    const userInput5 = '[1],0';
    const funcInput5 = 'function foo(x,a){\n' +
        '    return x[a];' +
        '}';
    let expectedOutput5 = 'st=>start\n' +
        'e1=>end: --1--\n' +
        'return x[a]; | isGreen\n' +
        '\n' +
        'st->e1\n';
    it('test5 - member return', () => {
        const output5 = codeAnalyzer.createFlowChart(funcInput5, userInput5);
        assert.deepEqual(output5, expectedOutput5);
    });

    const userInput6 = '0,2,[1,2]';
    const funcInput6 = 'function foo(x){\n' +
        '   let a ,b,c;\n' +
        '   a  = x[2]\n' +
        '   b = a[0]\n' +
        '   x[0] = x[2][0];\n' +
        '   a[0] = 1\n' +
        '   c = x[1]+ b\n' +
        '   if(x[1] == 1) {\n' +
        '   c = 5;\n' +
        '}\n' +
        '   return c;\n' +
        '}\n';

    let expectedOutput6 = 'st=>start\n' +
        'op1=>operation: --1--\n' +
        'let a, b, c; | isGreen\n' +
        '\n' +
        'op2=>operation: --2--\n' +
        'a = x[2] | isGreen\n' +
        '\n' +
        'op3=>operation: --3--\n' +
        'b = a[0] | isGreen\n' +
        '\n' +
        'op4=>operation: --4--\n' +
        'x[0] = x[2][0] | isGreen\n' +
        '\n' +
        'op5=>operation: --5--\n' +
        'a[0] = 1 | isGreen\n' +
        '\n' +
        'op6=>operation: --6--\n' +
        'c = x[1] + b | isGreen\n' +
        '\n' +
        'cond7=>condition: --7--\n' +
        'x[1] == 1; | isGreen\n' +
        '\n' +
        'op8=>operation: --8--\n' +
        'c = 5 \n' +
        '\n' +
        'e9=>end: --9--\n' +
        'return c; | isGreen\n' +
        '\n' +
        'st->op1\n' +
        'op1->op2\n' +
        'op2->op3\n' +
        'op3->op4\n' +
        'op4->op5\n' +
        'op5->op6\n' +
        'op6->cond7\n' +
        'cond7(yes)->op8\n' +
        'cond7(no)->e9\n' +
        'op8->e9\n';

    it('test6 many members opp', () => {
        const output6 = codeAnalyzer.createFlowChart(funcInput6, userInput6);
        assert.deepEqual(output6, expectedOutput6);
    });

    const userInput7 = 'true';
    const funcInput7 = 'function foo(x){\n' +
        '   let a = !x;\n' +
        '   while(x){}\n' +
        '   if(!x){}\n' +
        '   else{}\n' +
        '   return 7;\n' +
        '}\n';

    let expectedOutput7 = 'st=>start\n' +
        'op1=>operation: --1--\n' +
        'let a = !x; | isGreen\n' +
        '\n' +
        'cond2=>condition: --2--\n' +
        'x; | isGreen\n' +
        '\n' +
        'cond3=>condition: --3--\n' +
        '!x; | isGreen\n' +
        '\n' +
        'e4=>end: --4--\n' +
        'return 7; | isGreen\n' +
        '\n' +
        'st->op1\n' +
        'op1->cond2\n' +
        'cond2(no)->cond3\n' +
        'cond3(yes)->e4\n' +
        'cond3(no)->e4\n';

    it('test7 empty while and if', () => {
        const output7 = codeAnalyzer.createFlowChart(funcInput7, userInput7);
        assert.deepEqual(output7, expectedOutput7);
    });

    const userInput8 = 'true';
    const funcInput8 = 'function foo(x){\n' +
        '   let a = !x;\n' +
        '   while(x){}\n' +
        '   if(!x){}\n' +
        '   else{}\n' +
        '}';

    let expectedOutput8 = 'st=>start\n' +
        'op1=>operation: --1--\n' +
        'let a = !x; | isGreen\n' +
        '\n' +
        'cond2=>condition: --2--\n' +
        'x; | isGreen\n' +
        '\n' +
        'cond3=>condition: --3--\n' +
        '!x; | isGreen\n' +
        '\n' +
        'st->op1\n' +
        'op1->cond2\n' +
        'cond2(no)->cond3\n';

    it('test8 empty while and if - and no return after', () => {
        const output8 = codeAnalyzer.createFlowChart(funcInput8, userInput8);
        assert.deepEqual(output8, expectedOutput8);
    });

    const userInput9 = '1,2,[0,3,0]';
    let funcInput9 = 'function foo(x, y, z){\n' +
        '    let a = x + 1;\n' +
        '    let b = a + y;\n' +
        '    let c = 0;\n' +
        '    \n' +
        '    if ((b < z[1])) {\n' +
        '        c = c + 5;\n' +
        '    } else if (b < z[x] * 2) {\n' +
        'd = c + x + 5;\n' +
        'let d = a + y;\n' +
        '       \n' +
        '    } else {\n' +
        '        c = c + z + 5;\n' +
        '    }\n' +
        '    \n' +
        '    return c;\n' +
        '}';

    const expectedOutput9 = 'st=>start\n' +
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
        'b < z[1]; | isGreen\n' +
        '\n' +
        'op5=>operation: --5--\n' +
        'c = c + 5 \n' +
        '\n' +
        'cond6=>condition: --6--\n' +
        'b < z[x] * 2; | isGreen\n' +
        '\n' +
        'op7=>operation: --7--\n' +
        'd = c + x + 5 | isGreen\n' +
        '\n' +
        'op8=>operation: --8--\n' +
        'let d = a + y; | isGreen\n' +
        '\n' +
        'op9=>operation: --9--\n' +
        'c = c + z + 5 \n' +
        '\n' +
        'e10=>end: --10--\n' +
        'return c; | isGreen\n' +
        '\n' +
        'st->op1\n' +
        'op1->op2\n' +
        'op2->op3\n' +
        'op3->cond4\n' +
        'op7->op8\n' +
        'cond6(yes)->op7\n' +
        'cond6(no)->op9\n' +
        'cond4(yes)->op5\n' +
        'cond4(no)->cond6\n' +
        'op5->e10\n' +
        'op8->e10\n' +
        'op9->e10\n';

    it('test9 ', () => {
        const output9 = codeAnalyzer.createFlowChart(funcInput9, userInput9);
        assert.deepEqual(output9, expectedOutput9);
    });

    const userInput10 = '[0]';
    let funcInput10 = 'function foo(x){\n' +
        '   let a = x[0];\n' +
        '   let b = [1,2,a];\n' +
        '   return b;\n' +
        '}';
;
    const expectedOutput10 = 'st=>start\n' +
        'op1=>operation: --1--\n' +
        'let a = x[0]; | isGreen\n' +
        '\n' +
        'op2=>operation: --2--\n' +
        'let b = [\n' +
        '    1,\n' +
        '    2,\n' +
        '    a\n' +
        ']; | isGreen\n' +
        '\n' +
        'e3=>end: --3--\n' +
        'return b; | isGreen\n' +
        '\n' +
        'st->op1\n' +
        'op1->op2\n' +
        'op2->e3\n';

    it('test10 ', () => {
        const output10 = codeAnalyzer.createFlowChart(funcInput10, userInput10);
        assert.deepEqual(output10, expectedOutput10);
    });

    const userInput11 = '[0]';
    let funcInput11 = 'function foo(x){\n' +
        '   let a = 0;\n' +
        '   let b = x[a];\n' +
        '   let c = [0,2,b];\n' +
        '   if (c[a] == b)\n' +
        '       return 5;\n' +
        '}';
    ;
    const expectedOutput11 = 'st=>start\n' +
        'op1=>operation: --1--\n' +
        'let a = 0; | isGreen\n' +
        '\n' +
        'op2=>operation: --2--\n' +
        'let b = x[a]; | isGreen\n' +
        '\n' +
        'op3=>operation: --3--\n' +
        'let c = [\n' +
        '    0,\n' +
        '    2,\n' +
        '    b\n' +
        ']; | isGreen\n' +
        '\n' +
        'cond4=>condition: --4--\n' +
        'c[a] == b; | isGreen\n' +
        '\n' +
        'e5=>end: --5--\n' +
        'return 5; | isGreen\n' +
        '\n' +
        'st->op1\n' +
        'op1->op2\n' +
        'op2->op3\n' +
        'op3->cond4\n' +
        'cond4(yes)->e5\n';

    it('test11 ', () => {
        const output11 = codeAnalyzer.createFlowChart(funcInput11, userInput11);
        assert.deepEqual(output11, expectedOutput11);
    });

    const userInput12 = '';
    let funcInput12 = 'function foo(){\n' +
        '   a[0] = 5;\n' +
        '   a[0] = 6;\n' +
        '   return a[0]\n' +
        '}';

    const expectedOutput12 = 'st=>start\n' +
        'op1=>operation: --1--\n' +
        'a[0] = 5 | isGreen\n' +
        '\n' +
        'op2=>operation: --2--\n' +
        'a[0] = 6 | isGreen\n' +
        '\n' +
        'e3=>end: --3--\n' +
        'return a[0]; | isGreen\n' +
        '\n' +
        'st->op1\n' +
        'op1->op2\n' +
        'op2->e3\n';

    it('test12 ', () => {
        const output12 = codeAnalyzer.createFlowChart(funcInput12, userInput12);
        assert.deepEqual(output12, expectedOutput12);
    });

});