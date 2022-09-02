
 
 /**
  * 把 obj2 的原型合并到 obj1 的原型上
  * 如果原型的键以 Getter 结尾，则将会把其挂载为 getter 属性
  * @param obj1 要挂载到的对象
  * @param obj2 要进行挂载的对象
  */
 export const assignPrototype = function(obj1: {[key: string]: any}, obj2: {[key: string]: any}) {
     Object.getOwnPropertyNames(obj2.prototype).forEach(key => {
         if (key.includes('Getter')) {
             Object.defineProperty(obj1.prototype, key.split('Getter')[0], {
                 get: obj2.prototype[key],
                 enumerable: false,
                 configurable: true
             })
         }
         
         else obj1.prototype[key] = obj2.prototype[key]
     })
 }


export function connectedComponents(adj) {
  var numVertices = adj.length
  var visited = new Array(numVertices)
  for(var i=0; i<numVertices; ++i) {
    visited[i] = false
  }
  var components = []
  for(var i=0; i<numVertices; ++i) {
    if(visited[i]) {
      continue
    }
    var toVisit = [i]
    var cc = [i]
    visited[i] = true
    while(toVisit.length > 0) {
      var v = toVisit.pop()
      var nbhd = adj[v]
      for(var j=0; j<nbhd.length; ++j) {
        var u = nbhd[j]
        if(!visited[u]) {
          visited[u] = true
          toVisit.push(u)
          cc.push(u)
        }
      }
    }
    components.push(cc)
  }
  return components
}

export function binarySearch (arr, x, start, end) {
      
  // Base Condition
  if (start > end) return false;

  // Find the middle index
  let mid=Math.floor((start + end)/2);

  // Compare mid with given key x
  if (arr[mid]===x) return true;
       
  // If element at mid is greater than x,
  // search in the left half of mid
  if(arr[mid] > x)
      return binarySearch(arr, x, start, mid-1);
  else

      // If element at mid is smaller than x,
      // search in the right half of mid
      return binarySearch(arr, x, mid+1, end);
}

export function intersection(setA, setB) {
  let _intersection = new Set();
  for (let elem of setB) {
      if (setA.has(elem)) {
          _intersection.add(elem);
      }
  }
  return _intersection;
}

export function difference(setA, setB) {
  let _difference = new Set(setA);
  for (let elem of setB) {
      _difference.delete(elem);
  }
  return _difference;
}