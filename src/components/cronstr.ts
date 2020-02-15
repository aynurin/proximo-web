// import cronstrue from 'cronstrue';
// import { CronParser } from 'cronstrue/cronParser';

export default function cronstr(cronparts: Array<string>): string {
    return buildit(cronparts);
    // const cronstr = ['*', '*', '*', ...cronparts].join(' ');
    // // const parser = new CronParser(cronstr);
    // // const parsed = parser.parse();
    // // console.log(parsed)
    // let str = cronstrue.toString(cronstr);
    // str = str.replace('Every second, ', '');
    // str = str.replace(/on day (\d+)(?= )/gm, onDayReplace);
    // return str;
}

function buildit(parts: Array<string>): string {
    let result = '';
    let dateParams = parseParam(parts[0]);
    let anyDate = dateParams.find(p => p.valueIsAny) != null;
    let monthParams = parseParam(parts[1]);
    let anyMonth = monthParams.find(p => p.valueIsAny) != null;
    let dayOfWeekParams = parseParam(parts[2]);
    let anyDayOfWeek = dayOfWeekParams.find(p => p.valueIsAny) != null;
    let yearParams = parseParam(parts[3]);
    let anyYear = yearParams.find(p => p.valueIsAny) != null;

    let commaYear = dateParams[0].valueIsNumber;

    if (!anyDate) {
        let ranges = [];
        for (const range of dateParams) {
            if (range.valueIsNumber) {
                ranges.push(ordinal_suffix_of(range.valueNumber));
            } else if (range.valueIsRange) {
                ranges.push(ordinal_suffix_of(range.valueRangeStart) + ' through ' + ordinal_suffix_of(range.valueRangeEnd));
            }
        }
        result += ranges.join(', ');
    } else if (!anyDayOfWeek) {
        let ranges = [];
        for (const range of dayOfWeekParams) {
            if (range.valueIsNumber) {
                if (range.nth) {
                    ranges.push(countable_of(range.nth) + ' ' + weekday_name_of(range.valueNumber));
                } else {
                    ranges.push(weekday_name_of(range.valueNumber));
                }
            } else if (range.valueIsRange) {
                ranges.push(weekday_name_of(range.valueRangeStart) + ' through ' + weekday_name_of(range.valueRangeEnd));
            }
        }
        if (!anyMonth && dayOfWeekParams[0].nth) {
            result += capitalize(ranges.join(', '));
        } else {
            result += 'Every ' + ranges.join(', ');
        }
    } else {
        result = 'Every day'
    }

    if (!anyMonth) {
        let ranges = [];
        for (const range of monthParams) {
            if (range.valueIsNumber) {
                ranges.push(month_name_of(range.valueNumber));
            } else if (range.valueIsRange) {
                ranges.push(month_name_of(range.valueRangeStart) + ' through ' + month_name_of(range.valueRangeEnd));
            }
        }
        if (monthParams[0].valueIsNumber) {
            result += ' of ' + ranges.join(', ');
        } else {
            result += ', ' + ranges.join(', ');
        }
    } else if (dateParams.find(p => p.valueIsAny) == null) {
        result += ' of the month';
    }

    if (!anyYear) {
        let ranges = [];
        for (const range of yearParams) {
            if (range.valueIsNumber) {
                ranges.push(range.valueNumber);
            } else if (range.valueIsRange) {
                ranges.push(range.valueRangeStart + ' through ' + range.valueRangeEnd);
            }
        }
        if (commaYear) {
            result += ', ' + ranges.join(', ');
        } else {
            result += ' in ' + ranges.join(', ');
        }
    }

    return result;
}

interface RangeDefinition {
    valueIsAny: boolean,
    valueIsNumber: boolean,
    valueIsRange: boolean,
    valueNumber: number | null,
    valueRangeStart: number | null,
    valueRangeEnd: number | null,
    step: number | null,
    nth: number | null
}

function parseParam(strVal: string): RangeDefinition[] {
    const rangesDefinitions = strVal.split(',');
    const ranges = [];
    for (const rangesDefinition of rangesDefinitions) {
        const rangeWithStepDefinition = rangesDefinition.split('/');
        let step:number = null;
        if (rangeWithStepDefinition.length > 1) {
            step = parseInt(rangeWithStepDefinition[1]);
        }
        const rangeWithNthDefinition = rangesDefinition.split('#');
        let nth:number = null;
        if (rangeWithNthDefinition.length > 1) {
            nth = parseInt(rangeWithNthDefinition[1]);
        }
        const boundariesDefinitions = rangeWithStepDefinition[0].split('-');
        let valueIsAny = false;
        let valueIsNumber = false;
        let valueNumber: number = null;
        let valueIsRange = false;
        let valueRangeStart: number = null;
        let valueRangeEnd: number = null;
        if (boundariesDefinitions.length === 1 && (boundariesDefinitions[0] === '*' || boundariesDefinitions[0] === '?')) {
            valueIsAny = true;
        } else if (boundariesDefinitions.length === 1) {
            valueIsNumber = true;
            valueNumber = parseInt(boundariesDefinitions[0]);
        } else if (boundariesDefinitions.length === 2) {
            valueIsRange = true;
            valueRangeStart = parseInt(boundariesDefinitions[0]);
            valueRangeEnd = parseInt(boundariesDefinitions[1]);
        }
        ranges.push({
            valueIsAny,
            valueIsNumber,
            valueIsRange,
            valueNumber,
            valueRangeStart,
            valueRangeEnd,
            step,
            nth
        })
    }
    return ranges;
}

function capitalize(str: string): string {
    return str[0].toLocaleUpperCase() + str.slice(1);
}

const countables = ["first", "second", "third", "fourth", "fifth"];
function countable_of(num: number): string {
    return countables[num - 1];
}

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
function weekday_name_of(num) {
    return weekdays[num-1];
}

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
function month_name_of(num) {
    return monthNames[num-1];
}

// https://stackoverflow.com/a/13627586/502818
function ordinal_suffix_of(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}