import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.should();
chai.use(sinonChai);

import util from 'util';

import villain from '../src/index';

describe('Villain Mustache', () => {
    it('should not alter labels without mustache markup', () => {
        let label = 'I am your father';
        villain(label).should.equal(label);
    });

    it('should replace {{var}} with var\'s value', () => {
        let label = 'My name is {{name}}, king of kings';
        let context = {name: 'Ozymandias'};
        let expected = 'My name is Ozymandias, king of kings';

        villain(label, context).should.equal(expected);
    });

    it('should replace {{var.sub}} with var.sub\'s value', () => {
        let label = 'My name is {{king.name}}, king of kings';
        let context = {king: {name: 'Ozymandias'}};
        let expected = 'My name is Ozymandias, king of kings';

        villain(label, context).should.equal(expected);
    });

    it('should compile {{#if}} to the adequate contents', () => {
        let label = 'Gandalf: "{{#if lateAndSorry}}Fly, you fools!{{else if late}}A wizard is never late.' +
            '{{else}}End? No, the journey doesn\'t end here.{{/if}}"';
        let context = {lateAndSorry: false, late: true};
        let expected = 'Gandalf: "A wizard is never late."';

        villain(label, context).should.equal(expected);
    });

    it('should compile nested {{#if}}s correctly', () => {
        let label = 'A{{#if x}}B{{else if y}}C' +
            '{{#if z}}E{{else}}D{{/if}}C{{else}}F{{/if}}';
        let context = {x: false, y: true, z: false};
        let expected = 'ACDC';

        villain(label, context).should.equal(expected);
    });

    it('should keep unmatched {{else if}}, {{else}}, {{/if}}', () => {
        let label = '{{/if}}';
        let context = {trueCondition: true, fakeCondition: true};
        let expected = '{{/if}}';

        villain(label, context).should.equal(expected);
    });

    it('should output a warning on unmatched {{else if}}, {{else}}, {{/if}}', () => {
        let label = '{{/if}}';

        let spy = sinon.spy(console, 'warn');

        villain(label, context);

        spy.should.have.been.called;

        console.warn.restore();
    });

    it('should output content when there is no {{/if}}', () => {
        let label = '{{#if trueCondition}}Hello!';
        let context = {trueCondition: true};
        let expected = 'Hello!';

        villain(label, context).should.equal(expected);
    });

    it('should output a warning when there is no {{/if}}', () => {
        let label = '{{#if trueCondition}}Hello!';
        let context = {trueCondition: true};

        let spy = sinon.spy(console, 'warn');

        villain(label, context);

        spy.should.have.been.called;

        console.warn.restore();
    });

    it('should assume false when a condition is not provided in context', () => {
        let label = '{{#if trueCondition}}Hello!{{/if}}';
        let expected = '';

        villain(label, undefined).should.equal(expected);
    });

    it('should output null variables', () => {
        let label = '{{var}}';
        let context = {var: null};
        let expected = 'null';

        villain(label, context).should.equal(expected);
    });

    it('should output undefined variables', () => {
        let label = '{{var}}';
        let context = {var: undefined};
        let expected = 'undefined';

        villain(label, context).should.equal(expected);
    });

    it('should output object variables as a useful string representation (node.js util.inspect)', () => {
        let label = '{{var}}';
        let context = {var: {a: 'a', b: {c: 'c'}}};
        let expected = util.inspect(context.var);

        villain(label, context).should.equal(expected);
    });

    it('should comment {{! }}', () => {
        let label = '{{!var}}';
        let context = {var: 'a'};
        let expected = '';

        villain(label, context).should.equal(expected);
    });
});
