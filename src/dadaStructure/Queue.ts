/*
    From Ricardo Borges
*/

class Queue<T> {
    private array: T[] = [];
  
    add(data: T): void {
      this.array.push(data);
    }
  
    remove(): T | undefined {
      if (this.isEmpty()) console.log("Queue empty, can't remove");
      ;
  
      return this.array.shift();
    }
  
    peek(): T {
      if (this.isEmpty()) console.log("Queue empty, can't peek");
  
      return this.array[0];
    }
  
    isEmpty(): boolean {
      return this.array.length === 0;
    }
  }

