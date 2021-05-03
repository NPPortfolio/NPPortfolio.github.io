class FixedLengthQueue {


    constructor(length) {

        this.memory = new Array(length);

        this.empty = true;




        /*
        *                0  1  2  3  4   5  6  7 
        *               [s] [] [] [] [] [e] [] []
        *
        *               The start and end values are "on" the data, not "in-between" them
        */


        this.start = 0;
        this.end = 0;

    }

    push(data) {

        if (this.canPush()) {
            
            if(!this.empty){
                this.end = this.incrementOf(this.end);
                this.memory[this.end] = data;
            }

            else{
                this.memory[this.end] = data;
                this.empty = false;
            }
        }
    }

    shift() {

        if (this.empty) return null;

        let ret = this.memory[this.start];

        if (this.start == this.end) {
            this.empty = true;
        }

        else {
            this.start = this.incrementOf(this.start);
        }

        return ret;

    }

    pop() {
        if (this.canPop()) {

            //return this.memory[this.end++];
        }
    }



    /**
    increment(x) {
        x++;
        if (x == this.memory.length) x = 0;
    }

    decrement(x) {
        x--;
        if (x < 0) x = this.memory.length;
    }**/


    incrementOf(x) {
        if ((x + 1) == this.memory.length) {
            return 0;
        }
        else {
            return x + 1;
        }
    }

    decrementOf(x) {
        if ((x - 1) < 0) {
            return this.memory.length;
        }
        else {
            return x - 1;
        }
    }



    canPush() {
        return (this.incrementOf(this.end) != this.start);
    }

    canPop() {
        // edge case here needs explaining
        // also needs fixing
        return !this.empty
    }

    canShift() {
        return !this.empty;
    }



    clear() {
        this.start = 0;
        this.end = 0;
    }

    length() {

        if (this.empty) return 0;

        if (this.end >= this.start) {
            let x = this.end - this.start;
            if (x == 0) return 1;
            return x;
        }

        else {
            return this.memory.length - (this.start - this.end) + 1;
        }

    }

}

// Maybe could use inheritance
class FixedLengthArray{

    constructor(length){
        this.memory = new Array(length);
        this.end = -1;
    }

    push(data){

        // This means that if you try to push a full array it overwrites the last element, not sure if you want that
        this.memory[this.end] = data;
        if(this.end != this.memory.length - 1){
            this.end++
        }

    }

    clear(){
        this.end = -1;
    }

    includes(data){
        console.log(this.end);
        for(let i = 0; i <= this.end; i++){
            if(this.memory[i] === data) return true;
        }
        return false;
    }

    length(){
        return this.end + 1;
    }

    get(i){
        return this.memory[i];
    }
}