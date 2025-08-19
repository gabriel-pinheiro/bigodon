const Lab = require('@hapi/lab');
const Code = require('@hapi/code');

const { compile } = require('../../dist');

const { describe, it } = exports.lab = Lab.script();
const { expect } = Code;


describe('runtime', () => {
  describe('variables', () => {
    it('should assign and use simple variables', async () => {
      const template = compile('{{= $name "John"}}Hello, {{ $name }}!');
      expect(await template()).to.equal('Hello, John!');
    });

    it('should assign and use number variables', async () => {
      const template = compile('{{= $count 42}}Count: {{ $count }}');
      expect(await template()).to.equal('Count: 42');
    });

    it('should assign and use boolean variables', async () => {
      const template = compile('{{= $isActive true}}{{#if $isActive}}Active{{/if}}');
      expect(await template()).to.equal('Active');
    });

    it('should assign variables from context data', async () => {
      const template = compile('{{= $userName user.name}}Hello, {{ $userName }}!');
      expect(await template({ user: { name: 'Alice' } })).to.equal('Hello, Alice!');
    });

    it('should assign variables from helper results', async () => {
      const template = compile('{{= $upperName (uppercase name)}}{{ $upperName }}');
      expect(await template({ name: 'john' })).to.equal('JOHN');
    });

    it('should handle multiple variable assignments', async () => {
      const template = compile('{{= $x 1}}{{= $y 2}}{{= $sum (add $x $y)}}Result: {{ $sum }}');
      expect(await template()).to.equal('Result: 3');
    });

    it('should allow variable reassignment', async () => {
      const template = compile('{{= $value "first"}}{{ $value }}{{= $value "second"}}{{ $value }}');
      expect(await template()).to.equal('firstsecond');
    });

    it('should handle variables in blocks', async () => {
      const template = compile('{{= $show true}}{{#if $show}}{{= $message "visible"}}{{ $message }}{{/if}}');
      expect(await template()).to.equal('visible');
    });

    it('should handle variables in else blocks', async () => {
      const template = compile('{{= $show false}}{{#if $show}}hidden{{else}}{{= $message "visible"}}{{ $message }}{{/if}}');
      expect(await template()).to.equal('visible');
    });

    it('should handle nested variable scoping in blocks', async () => {
      const template = compile(`
{{= $outer "outer"}}
{{#items}}
{{= $inner $this}}
{{ $outer }} - {{ $inner }}
{{/items}}
{{ $outer }} - {{ $inner }}
              `.trim());
      const actual = (await template({ items: ['a', 'b'] })).replace(/\s+/g, ' ').trim();
      const expected = 'outer - a\n  outer - b\nouter - b'.replace(/\s+/g, ' ');
      expect(actual).to.equal(expected);
    });

    it('should handle variables with helper calls', async () => {
      const template = compile('{{= $name "john"}}{{capitalize $name}}');
      expect(await template()).to.equal('John');
    });

    it('should handle complex expressions with variables', async () => {
      const template = compile('{{= $greeting "Hello"}}{{= $name "World"}}{{append $greeting ", " (uppercase $name) "!"}}');
      expect(await template()).to.equal('Hello, WORLD!');
    });

    it('should return empty string for undefined variables', async () => {
      const template = compile('Value: "{{ $undefined }}"');
      expect(await template()).to.equal('Value: ""');
    });

    it('should handle variables assigned from other variables', async () => {
      const template = compile('{{= $original "test"}}{{= $copy $original}}{{ $copy }}');
      expect(await template()).to.equal('test');
    });

    it('should maintain variable state within single template execution', async () => {
      const template = compile(`
{{= $counter 0}}
{{#items}}
{{= $counter (add $counter 1)}}
Item {{ $counter }}
{{/items}}
Total: {{ $counter }}
              `.trim());
      const actual = (await template({ items: ['a', 'b', 'c'] })).replace(/\s+/g, ' ').trim();
      const expected = 'Item 1 Item 2 Item 3 Total: 3';
      expect(actual).to.equal(expected);
    });

    it('should handle assignment with complex helper expressions', async () => {
      const template = compile('{{= $result (add (multiply 3 4) 2)}}{{ $result }}');
      expect(await template()).to.equal('14');
    });

    it('should handle null and undefined variable assignments', async () => {
      const template = compile('{{= $nullVar null}}{{= $undefVar undefined}}{{ $nullVar }}|{{ $undefVar }}');
      expect(await template()).to.equal('|');
    });

    it('should handle variable scoping with nested blocks', async () => {
      const template = compile(`{{= $outer "global"}}
{{#condition}}
{{= $inner "block"}}
{{ $outer }}-{{ $inner }}
{{#nested}}
  {{= $deep "nested"}}
  {{ $outer }}-{{ $inner }}-{{ $deep }}
{{/nested}}
{{/condition}}
{{ $outer }}-{{ $inner }}-{{ $deep }}`);
      const actual = (await template({ condition: true, nested: true })).replace(/\s+/g, ' ').trim();
      const expected = 'global-block global-block-nested global-block-nested'.replace(/\s+/g, ' ');
      expect(actual).to.equal(expected);
    });

    it('should handle variables with falsy values in conditions', async () => {
      const template = compile('{{= $zero 0}}{{= $empty ""}}{{= $false false}}{{typeof $zero}} {{typeof $empty}} {{typeof $false}}');
      expect(await template()).to.equal('number string boolean');
    });

    it('should handle variable reassignment in loops', async () => {
      const template = compile(`
{{= $sum 0}}
{{#numbers}}
{{= $sum (add $sum $this)}}
{{/numbers}}
{{ $sum }}
              `.trim());
      const actual = (await template({ numbers: [1, 2, 3, 4, 5] })).replace(/\s+/g, ' ').trim();
      const expected = '15';
      expect(actual).to.equal(expected);
    });

    it('should handle variables in else if chains', async () => {
      const template = compile(`
{{= $status "pending"}}
{{#is $status "complete"}}
Done!
{{else is $status "pending"}}
In progress...
{{else}}
Unknown status
{{/is}}
              `.trim());
      expect((await template()).trim()).to.equal('In progress...');
    });

    it('should not leak variables between template instances', async () => {
      const template = compile(`
{{#shouldSet}}
  {{= $foo "bar"}}
{{/shouldSet}}
{{ default $foo "baz" }}
              `.trim());
      expect((await template({ shouldSet: true })).trim()).to.equal('bar');
      expect((await template({ shouldSet: false })).trim()).to.equal('baz');
    });
  });
});
