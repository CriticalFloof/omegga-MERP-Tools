
export function diceRoll(limit,amount,modifier) {
    //returns an array of random numbers
    limit = parseInt(limit)
    amount = parseInt(amount)
    modifier = parseInt(modifier)
    let diceIndex = [];
    for(let i = 0; i < amount; i++) {
        diceIndex.push(Math.ceil(Math.random()*limit+modifier))
    };
    return(diceIndex);
};