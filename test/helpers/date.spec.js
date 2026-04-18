const Lab = require('@hapi/lab');
const Code = require('@hapi/code');

const { compile } = require('../../dist');

const { describe, it } = exports.lab = Lab.script();
const { expect } = Code;

describe('helpers', () => { describe('date', () => {

    describe('date', () => {
        it('should create dates from timestamps', async () => {
            const templ = compile('{{dateIso (date 1704067200000)}}');
            expect(await templ()).to.equal('2024-01-01T00:00:00.000Z');
        });

        it('should create dates from ISO strings with explicit time', async () => {
            const templ = compile('{{dateIso (date "2024-01-01T03:04:05.000Z")}}');
            expect(await templ()).to.equal('2024-01-01T03:04:05.000Z');
        });

        it('should reject date strings without time component', async () => {
            const templ = compile('{{date "2024-01-01"}}');
            await expect(templ()).to.reject(/date string must include an explicit time component/i);
        });

        it('should reject invalid date input types', async () => {
            const templ = compile('{{date true}}');
            await expect(templ()).to.reject(/date input must be a Date, timestamp number, or ISO string with time/i);
        });

        it('should reject non-finite timestamp numbers', async () => {
            const templ = compile('{{date value}}');
            await expect(templ({ value: Infinity })).to.reject(/date input number must be finite/i);
        });

    });

    describe('now', () => {
        it('should create a Date object', async () => {
            const templ = compile('{{typeof (now)}}');
            expect(await templ()).to.equal('object');
        });

        it('should reject arguments', async () => {
            const templ = compile('{{now 1}}');
            await expect(templ()).to.reject(/now does not accept arguments/i);
        });

    });

    describe('dateAdd/dateSub', () => {
        it('should add fixed units', async () => {
            const templ = compile('{{dateIso (dateAdd (date "2024-01-01T00:00:00.000Z") 90 "min")}}');
            expect(await templ()).to.equal('2024-01-01T01:30:00.000Z');
        });

        it('should support second aliases', async () => {
            const templ = compile('{{dateIso (dateAdd (date "2024-01-01T00:00:00.000Z") 30 "second")}}');
            expect(await templ()).to.equal('2024-01-01T00:00:30.000Z');
        });

        it('should support hour aliases', async () => {
            const templ = compile('{{dateIso (dateAdd (date "2024-01-01T00:00:00.000Z") 12 "h")}}');
            expect(await templ()).to.equal('2024-01-01T12:00:00.000Z');
        });

        it('should add calendar units using UTC semantics', async () => {
            const templ = compile('{{dateIso (dateAdd (date "2024-01-15T00:00:00.000Z") 1 "month")}}');
            expect(await templ()).to.equal('2024-02-15T00:00:00.000Z');
        });

        it('should add years using UTC semantics', async () => {
            const templ = compile('{{dateIso (dateAdd (date "2024-01-15T00:00:00.000Z") 1 "year")}}');
            expect(await templ()).to.equal('2025-01-15T00:00:00.000Z');
        });

        it('should remove time with dateSub', async () => {
            const templ = compile('{{dateIso (dateSub (date "2024-01-15T00:00:00.000Z") 2 "week")}}');
            expect(await templ()).to.equal('2024-01-01T00:00:00.000Z');
        });

        it('should not mutate original date', async () => {
            const templ = compile('{{= $d (date "2024-01-01T00:00:00.000Z")}}{{dateIso (dateAdd $d 1 "day")}}|{{dateIso $d}}');
            expect(await templ()).to.equal('2024-01-02T00:00:00.000Z|2024-01-01T00:00:00.000Z');
        });

        it('should reject unsupported units', async () => {
            const templ = compile('{{dateAdd (date "2024-01-01T00:00:00.000Z") 1 "fortnight"}}');
            await expect(templ()).to.reject(/unsupported date unit "fortnight"/i);
        });
    });

    describe('dateIso/dateTimestamp/dateDiff', () => {
        it('should return date iso string', async () => {
            const templ = compile('{{dateIso (date "2024-01-01T00:00:00.000Z")}}');
            expect(await templ()).to.equal('2024-01-01T00:00:00.000Z');
        });

        it('should return date timestamp', async () => {
            const templ = compile('{{dateTimestamp (date "2024-01-01T00:00:00.000Z")}}');
            expect(await templ()).to.equal('1704067200000');
        });

        it('should not expose the removed toTimestamp alias', async () => {
            const templ = compile('{{toTimestamp (date "2024-01-01T00:00:00.000Z")}}');
            await expect(templ()).to.reject(/helper toTimestamp not found/i);
        });

        it('should diff in milliseconds by default', async () => {
            const templ = compile('{{dateDiff (date "2024-01-01T00:00:01.000Z") (date "2024-01-01T00:00:00.000Z")}}');
            expect(await templ()).to.equal('1000');
        });

        it('should diff using provided unit', async () => {
            const templ = compile('{{dateDiff (date "2024-01-03T00:00:00.000Z") (date "2024-01-01T00:00:00.000Z") "day"}}');
            expect(await templ()).to.equal('2');
        });

        it('should reject month and year units for dateDiff', async () => {
            const templ = compile('{{dateDiff (date "2024-02-01T00:00:00.000Z") (date "2024-01-01T00:00:00.000Z") "month"}}');
            await expect(templ()).to.reject(/datediff supports up to week granularity/i);
        });
    });

}); });
