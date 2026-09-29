const targetNumber: number = 54;
const simulatedGuesses: number[] = [10, 60, 54, 42];

for (let i :number = 0; i<4; i++){
    let guess:number= simulatedGuesses[i];

    if(guess<targetNumber){
        console.log("you chose " + guess +" guess is too low");
    }
    else if(guess>targetNumber){
        console.log("you chose " + guess +" guess is too high");
    }
    else{
        console.log("you chose " + guess +" guess is correct");
    }
}