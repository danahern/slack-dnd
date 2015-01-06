// Pretty basic stuff. Should be part of Array.
Array.prototype.sum = function () {
    return this.reduce(function(a,r) {return a+=r}, 0);
}

// javascript arrays are sparse when using the constructor Array(size)
function denseArray(size) {
    return Array.apply(null, Array(size));
}

function sign(x) {
  return (x>0) - (x<0);
}

// return a random integer
//   if max = 0 return 0
//   if max > 0 pick from range 1..max
//   if max < 0 pick from range max..-1
function rollDie(max){
  return sign(max) * (Math.floor( Math.random() * Math.abs(max) ) + 1);
}

function rollDice(count, max) {
    return denseArray(count).map(function(_,_) {return rollDie(max)});
}

function applyModifier(total, modifier) {
    if( isNaN(modifier) ) { return ""; }

    return (modifier<=0?'':'+') + modifier + "=" + (total + modifier);
}

function detailedRolls(results) {
    if( results.length < 2 ) { return ""; }
    if( results.length > 100 ) { return ""; }

    return ' ['+results.sort(function(a,b){return a-b}).join(', ')+']';
}

function roll( command ) {
    var re = /(\d*)d([+-]?\d+)([+-]\d+)?/;
    var diceSpecs = re.exec(command) || [];       // parse the request, if it fails return an empty array instead of nil

    var numDice = parseInt(diceSpecs[1]) || 1; // default to 1 for the /roll d20 case
    var diceType = parseInt(diceSpecs[2]);
    var modifier = parseInt(diceSpecs[3]);

    // If there is no correctly specified die roll, default to 1d20
    if(isNaN(diceType)) {
        return roll( command + ' (1d20)' );
    }

    var results = rollDice(numDice, diceType);
    var total = results.sum();

    return ' rolled ' + command + ': ' + total + applyModifier(total, modifier) + detailedRolls(results);
}

exports.roll = roll;
