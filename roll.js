var _ = require('underscore');
var math = require('mathjs');
var inWords = require('in-words').en;
var arrayToSentence = require('array-to-sentence');

// return a random integer
//   if max = 0 return 0
//   if max > 0 pick from range 1..max
//   if max < 0 pick from range max..-1
function rollDie(max){
    return math.sign(max) * _.random(1, math.abs(max));
}

function rollDice(count, max) {
    return _.map( _.range(count), function(_) {return rollDie(max)});
}

function applyModifier(total, modifier) {
    if( isNaN(modifier) ) { return ""; }

    return (modifier<=0?'':'+') + modifier + "=" + (total + modifier);
}

function detailedRolls(results) {
    if( results.length < 2 ) { return ""; }

    if( results.length < 10 ) {
        return ' [' + results.join(", ") + ']';
    }

    if( results.length < 1000 ) {
        var countedResults = _.countBy( results, _.identity );
        var englishResults = _.map( countedResults, function( count, roll ) { return inWords(count) + " " + roll + (count==1?"":"s") } );

        return ' ['+arrayToSentence(englishResults)+']';
    }

    return "";
}

function roll( command ) {
    var re = /(\d*)d([+-]?\d+)([+-]\d+)?/;

    var diceSpecs = re.exec(command);
    // If we don't have a valid roll, default to 1d20
    if( !diceSpecs ) {
        command += " (1d20)";
        diceSpecs = re.exec("1d20");
    }

    diceSpecs = _.map(diceSpecs, function(x) {return parseInt(x)});

    var numDice = diceSpecs[1] || 1; // default to 1 for the /roll d20 case
    var diceType = diceSpecs[2];
    var modifier = diceSpecs[3];

    var results = rollDice(numDice, diceType);
    var total = math.sum(results);

    return ' rolled ' + command + ': ' + total + applyModifier(total, modifier) + detailedRolls(results);
}

exports.roll = roll;
