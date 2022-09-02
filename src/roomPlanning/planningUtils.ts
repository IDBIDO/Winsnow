import { binarySearch } from "@/utils";
import { max, negate, xor } from "lodash";


export function equalPoint(pointA: [number, number], pointB: [number, number]): boolean {
    if (pointA[0] == pointB[0] && pointA[1] == pointB[1]) return true;
    return false;
}

export function maxTwoNumber(x:number, y: number) {
    if (x >= y) return x;
    return y;
}

export function translatePosToNode(pos: [number, number]): number {
    return pos[0]*50 + pos[1];
}

export function translateNodeToPos(node: number): [number, number] {
    return [Math.floor(node/50), node%50]
}

export function distanceTwoPoints(pointA: [x: number, y:number], pointB: [x: number, y:number]): number {

    //return Math.sqrt( (pointA[0]-pointB[0]) **2 + (pointA[1]-pointB[1]) **2 )
    let x = Math.sqrt( (pointA[0]-pointB[0]) **2);
    //console.log(x);
    
    let y = Math.sqrt( (pointA[1]-pointB[1]) **2);
    //console.log(y);
    
    return maxTwoNumber(x, y);


}

/*
    punto de distancia minima del listPoint un punto 'point' dado
*/

export function minDistance(point: [x: number, y: number], listPoint: [x: number, y: number][]): number {
    let pmim = listPoint[0];
    let disMin = distanceTwoPoints(point, listPoint[0]);
    let index = 0;
    
    for (let i = 1; i < listPoint.length; ++i) {
        let aux = distanceTwoPoints(point, listPoint[i]);
        if (aux < disMin) {
            disMin = aux;
            pmim = listPoint[i];
            index = i;
        }
    }
    //listPoint.splice(index, 1);
    
    return index;
    //return [pmim[0], pmim[1]];
}



export function transformToPoint(structurePos: number[]): Point {
    
    let point: Point = { "x": structurePos[0], "y":structurePos[1] };

    return point;
}

export function transformToPointList(model:{}) {
    let toPoint = {};
    for (let structureName in model) {        
        toPoint[structureName] = [];
        for (let i = 0; i < model[structureName].length; ++i) {
            toPoint[structureName].push( transformToPoint(model[structureName][i]) );
            //console.log(toPoint[structureName][i].x);
            
        }
        
    }

    return toPoint;
}


/*
    puntos de distancia 1 de un punto dado a una lista de puntos
*/
export function nearPoint(point: [x: number, y: number], listPoint: [x: number, y: number][]): number[] {
    
    let near: number[] = [];
    for (let i = 0; i < listPoint.length; ++i) {
        if (distanceTwoPoints(point, listPoint[i]) == 1) {
            near.push(i);
        }
    }
    return near;
}

export function nearPointOne(point: [x: number, y: number], listPoint: [x: number, y: number][]): number {
    
    let near: number;
    for (let i = 0; i < listPoint.length; ++i) {
        if (distanceTwoPoints(point, listPoint[i]) == 1) {
            near = i;
            break;
        }
    }
    return near;
}

export function transformRoadToAdjacentList(roadList: [x: number, y: number][]): number[][] {
    let adjacentList: number[][] = [];
    for (let i = 0; i < roadList.length; ++i) {
        adjacentList.push(nearPoint(roadList[i], roadList));
        //console.log(i , nearPoint(roadList[i], roadList));
        
    }
    //console.log(adjacentList);
    
    
    return adjacentList;
}

export function reconstructPath(beginPoint: number, endPoint: number, prev: number[]): number[] {
    let path:number[] = [];
    for (let at = endPoint; at != -1; at = prev[at]) {
        path.push(at)
    }
    path.reverse();

    if (path[0] == beginPoint) {
        return path;
    }

    return [];

}

export function solveBFS(roadList: number[][], beginPoint: number): number[] {

    //initialize visited array
    let visited: boolean[] = Array<boolean>();
    for (let i = 0; i < roadList.length; ++i) {
        visited.push(false);
    }

    // Use an array as our queue representation:
    let q: number[] = new Array<number>();

    visited[beginPoint] = true;

    q.push(beginPoint);

    //save path
    let path: number[] = new Array<number>();
    path.push(beginPoint);

    let prev = new Array<number>();
    for (let i = 0; i < roadList.length; ++i) {
        prev.push(-1);
    }

    while(q.length > 0) {

        const v = q.shift();
        for (let adjV of roadList[v]) {
            if (!visited[adjV]) {
                visited[adjV] = true;
                q.push(adjV);
                prev[adjV] = v;
            }
        }
    }
    return prev;
}

export function roadPath(roadList: number[][], beginPoint: number, endPoint: number) {
    let prev = solveBFS(roadList, beginPoint);

    return reconstructPath(beginPoint, endPoint, prev);
}

//get object's ID by roomName, position and structure type
export function getId(roomName: string, pos: [number, number], structureType: string) {

    //console.log(structureType);
    
    const position = new RoomPosition(pos[0], pos[1], roomName);
    const object = position.lookFor(structureType as keyof AllLookAtTypes);
    
    return object[0].id;
}


/*
    only valid if distance between two points are interger
*/
function pointsBetweenTwo(point1: [number, number], point2: [number, number]): [number, number][] {
    let x = point1[0] - point2[0];
    let y = point1[1] - point2[1];

    const max = maxTwoNumber(Math.abs(x), Math.abs(y)) ;
    const incX = -(x/max);
    const incY = -(y/max);

    let r = Array<[number, number]>(max);
    let actualX = point1[0];
    let actualY = point1[1];

    for (let i = 0; i < max; ++i ) {
      actualX += incX;
      actualY += incY;
      r[i] = [actualX, actualY];
        
    }
    r.pop();
    return r;
}

export function outOfPlanning(map: boolean[][], point: number) {

}

export function inMapRange(pos: [number, number]):boolean {
    
    if (pos[0]>= 0 && pos[0] < 50) {
        if (pos[1] >= 0 && pos[1] < 50) {            
            return true;            
        }
    }
    return false;
}

/*
    negative points will ignored
*/
export function nearPosition(pos: [number, number]):[number, number][] {
    
    let nearPoints: [number, number][] = [
        [pos[0]-1, pos[1]+1], 
        [pos[0]-1, pos[1]], 
        [pos[0]-1, pos[1]-1],

        [pos[0], pos[1]+1], 
        [pos[0], pos[1]-1], 

        [pos[0]+1, pos[1]+1], 
        [pos[0]+1, pos[1]], 
        [pos[0]+1, pos[1]-1], 
    ]
    
    let validNearPoints:[number, number][] = []
    for (let i = 0; i < nearPoints.length; ++i) {
        if (inMapRange(nearPoints[i])) {
            validNearPoints.push(nearPoints[i]);
        }
    }

    return validNearPoints;
}

export function isRampartPos(roomName: string, pos: [number, number]): boolean {
    
    const rampartDataList = Memory['colony'][roomName]['roomPlanning']['model']['rampart'];
    for (let i = 0; i < rampartDataList.length; ++i) {
        if (pos[0] == rampartDataList[i]['pos'][0] && pos[1] == rampartDataList[i]['pos'][1]) {
            return true;
        }
    }
    return false;

}

export function isRampartProtectPos(roomName: string, pos: [number, number]): boolean {
    const protectedPosList: number[] = Memory['colony'][roomName]['roomPlanning']['inRampartPos'];
    const posNode = translatePosToNode(pos);
    if (binarySearch(protectedPosList, posNode, 0, protectedPosList.length - 1 )) {
        return true;
    }
    return false;
}

export function getRangePoints(point: [number, number], range: number):[number, number][] {
    const angulo1: [number, number] = [point[0]-range, point[1]+ range];
    const angulo2: [number, number] = [point[0]+range, point[1]+ range];
    const angulo3: [number, number] = [point[0]+range, point[1]- range];
    const angulo4: [number, number] = [point[0]-range, point[1]- range];

    const r1 = [angulo1].concat(pointsBetweenTwo(angulo1, angulo2));
    const r2 = r1.concat([angulo2].concat(pointsBetweenTwo(angulo2, angulo3)));
    const r3 = r2.concat([angulo3].concat(pointsBetweenTwo(angulo3, angulo4)));
    const r4 = r3.concat([angulo4].concat(pointsBetweenTwo(angulo4, angulo1)));

    return r4;

}
