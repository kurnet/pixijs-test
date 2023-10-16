
export class Helper{
    public static GetRandomNumber(num:number, base:number) {
        return Math.floor(Math.random() * num) + base;
    }

    public static TimeoutPromise(ms:number) {
        return new Promise((resolve)=>{
            setTimeout(() => {
                resolve(true);
            }, ms);
        });        
    }

    public static ShuffleArray(array:any[]) {
        let currentIndex = array.length,  randomIndex;
      
        // While there remain elements to shuffle.
        while (currentIndex > 0) {
      
          // Pick a remaining element.
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
      
          // And swap it with the current element.
          [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
      
        return array;
      }
}