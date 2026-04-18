import { ensure } from '../../utils';

const TIME_COMPONENT_RE = /T\d{2}:\d{2}/;

const FIXED_UNIT_TO_MS = Object.freeze({
    ms: 1,
    s: 1000,
    min: 60 * 1000,
    h: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
});

type FixedDateUnit = keyof typeof FIXED_UNIT_TO_MS;
type CalendarDateUnit = 'month' | 'year';
type DateMathUnit = FixedDateUnit | CalendarDateUnit;

function ensureNoExtraArgs(args: any[], helperName: string) {
    ensure(args.length === 0, `${helperName} expects a single argument`);
}

function ensureFiniteNumber(value: any, argumentName: string): number {
    const num = Number(value);
    ensure(Number.isFinite(num), `${argumentName} must be a finite number`);
    return num;
}

function ensureValidDate(value: Date): Date {
    ensure(!isNaN(value.getTime()), 'invalid date');
    return value;
}

function fromDateString(value: string): Date {
    ensure(TIME_COMPONENT_RE.test(value), 'date string must include an explicit time component');
    return ensureValidDate(new Date(value));
}

function toDateValue(value: any): Date {
    if (value instanceof Date) {
        return ensureValidDate(new Date(value.getTime()));
    }

    if (typeof value === 'number') {
        ensure(Number.isFinite(value), 'date input number must be finite');
        return ensureValidDate(new Date(value));
    }

    if (typeof value === 'string') {
        return fromDateString(value);
    }

    throw new Error('date input must be a Date, timestamp number, or ISO string with time');
}

function normalizeDateMathUnit(value: any): DateMathUnit {
    ensure(typeof value === 'string', 'date unit must be a string');

    const normalized = value.trim().toLowerCase();
    switch (normalized) {
        case 'ms':
        case 'millisecond':
        case 'milliseconds':
            return 'ms';
        case 's':
        case 'sec':
        case 'secs':
        case 'second':
        case 'seconds':
            return 's';
        case 'min':
        case 'mins':
        case 'minute':
        case 'minutes':
            return 'min';
        case 'h':
        case 'hr':
        case 'hrs':
        case 'hour':
        case 'hours':
            return 'h';
        case 'day':
        case 'days':
            return 'day';
        case 'week':
        case 'weeks':
            return 'week';
        case 'month':
        case 'months':
            return 'month';
        case 'year':
        case 'years':
            return 'year';
        default:
            throw new Error(`unsupported date unit "${value}"`);
    }
}

function normalizeDateDiffUnit(value: any): FixedDateUnit {
    const unit = normalizeDateMathUnit(value);
    ensure(unit !== 'month' && unit !== 'year', 'dateDiff supports up to week granularity');
    return unit as FixedDateUnit;
}

function cloneDate(value: Date): Date {
    return new Date(value.getTime());
}

function date(input: any, ...rest: any[]): Date {
    ensureNoExtraArgs(rest, 'date');
    return toDateValue(input);
}

function now(...args: any[]): Date {
    ensure(args.length === 0, 'now does not accept arguments');
    return new Date();
}

function dateAdd(value: any, amount: any, unit: any): Date {
    const parsedDate = toDateValue(value);
    const amountNum = ensureFiniteNumber(amount, 'date amount');
    const normalizedUnit = normalizeDateMathUnit(unit);

    const next = cloneDate(parsedDate);
    if (normalizedUnit === 'month') {
        next.setUTCMonth(next.getUTCMonth() + amountNum);
        return ensureValidDate(next);
    }

    if (normalizedUnit === 'year') {
        next.setUTCFullYear(next.getUTCFullYear() + amountNum);
        return ensureValidDate(next);
    }

    const fixedUnitMs = FIXED_UNIT_TO_MS[normalizedUnit];
    return ensureValidDate(new Date(next.getTime() + (amountNum * fixedUnitMs)));
}

function dateSub(value: any, amount: any, unit: any): Date {
    const amountNum = ensureFiniteNumber(amount, 'date amount');
    return dateAdd(value, -amountNum, unit);
}

function dateIso(value: any): string {
    return toDateValue(value).toISOString();
}

function dateTimestamp(value: any): number {
    return toDateValue(value).getTime();
}

function dateDiff(a: any, b: any, unit: any = 'ms'): number {
    const left = toDateValue(a);
    const right = toDateValue(b);
    const normalizedUnit = normalizeDateDiffUnit(unit);
    const diffMs = left.getTime() - right.getTime();

    const unitMs = FIXED_UNIT_TO_MS[normalizedUnit];
    return diffMs / unitMs;
}

export const dateHelpers = Object.assign(Object.create(null), {
    date,
    now,
    dateAdd,
    dateSub,
    dateIso,
    dateTimestamp,
    dateDiff,
});
