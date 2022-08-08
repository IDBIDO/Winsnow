'use strict';

/**
 * 63超级扣位置自动布局
 * 能覆盖95% 地地形布局的覆盖
 * 
 * author：6g3y,Scorpior,Scokranotes,ChenyangDu
 * version:1.0.8
 * 
 * 【使用方法（傻瓜版）】
 * 1.设置4个flag，分别为对应房间的
 *     pc 控制器
 *     pm 矿
 *     pa pb 能量源
 * 2.下载63大佬的超级扣位置自动布局，解压并导入wasm二进制模块，
 *   命名（不要后缀）：algo_wasm_priorityqueue，确保此时文件夹中应当增了以下两个文件
 *     + 63超级扣位置自动布局_改良版.js
 *     + algo_wasm_priorityqueue.wasm
 * 
 * 3.在主循环代码的末尾，也就是main.js的module.exports.loop中最后一行添加
 *      require("63超级扣位置自动布局_改良版").run()
 * 
 * 4.运行（注意截图）
 * 5.放一个flag名字为p，随便放哪，运行会自动检测，检测到有p这个flag就会运行，运行完成会自动删掉
 *   显示的时间非常短，注意截图，消失了再放一个p又会重新运行一遍，不要反复折腾完，很耗CPU
 * 
 * 【使用方法（高级版）】
 * 1.计算位置
 *  [flagController,flagMineral,flagSourceA,flagSourceB]
 *  必须包含.pos对象 {{{ p.pos.x|y }}}
 * >> roomStructsData = ManagerPlanner.computeManor(p.pos.roomName,[pc,pm,pa,pb])
 * 
 * 2.可视化显示
 * >> HelperVisual.showRoomStructures(roomStructsData.roomName,roomStructsData.structMap)
 * 
 * 【结果说明】
 * {
 *       roomName: roomName
 *       storagePos: {x,y} //storage集群中心位置
 *       labPos: {x,y} //lab中心位置
 *       structMap:{ "rampart" : [[x1,y1],[x2,y2] ...] ...} 
 *           "建筑类型，直接用没问题的":[[x1,y1]]
 *           //建造的时候按顺序就可以了 ，顺序是距离 storagePos 排序过后的（除了road）
 *           //具体建造多少个，使用 CONTROLLER_STRUCTURES 获取当前可以造多少
 * }
 * 
 * 
 * 【警告】
 * ！！警告！！ 确保你的bucket和可运行CPU超过100个 ！！警告！！
 * ！！警告！！ 确保你的bucket和可运行CPU超过100个 ！！警告！！
 * ！！警告！！ 确保你的bucket和可运行CPU超过100个 ！！警告！！
 * ！！警告！！ 确保你的bucket和可运行CPU超过100个 ！！警告！！
 * ！！警告！！ 确保你的bucket和可运行CPU超过100个 ！！警告！！
 * ！！警告！！ 确保你的bucket和可运行CPU超过100个 ！！警告！！
 * 
 * 
 * 【原理】：能跑就行有空 写篇简书
 * 【代码】：挺乱的 如果有机会在整理一下代码
 * 
 * 【更新说明】：
 * 1.优化了外矿的寻路
 * 2.优化了塔的布局
 * 3.更新了说明文档
 * 
 * 感谢63！
 * 
 */


 
/**
 *  wasm 优先队列
 *  帮你加速涉及优先级的调度算法
 *  
 *  author: Scorpior
 *  version: v1.1.0
 *  
 *  usage: 
 *  1. add .js and .wasm modules
 *  2. require .js module and use
 *
 *  本人有改动！
 */

 global.structuresShape= {
    "spawn": "◎",
    "extension": "ⓔ",
    "link": "◈",
    "road": "•",
    "constructedWall": "▓",
    "rampart": "⊙",
    "storage": "▤",
    "tower": "🔫",
    "observer": "👀",
    "powerSpawn": "❂",
    "extractor": "⇌",
    "terminal": "✡",
    "lab": "☢",
    "container": "□",
    "nuker": "▲",
    "factory": "☭"
};
global.structuresColor= {
    "spawn": "cyan",
    "extension": "#0bb118",
    "link": "yellow",
    "road": "#fa6f6f",
    "constructedWall": "#003fff",
    "rampart": "#003fff",
    "storage": "yellow",
    "tower": "cyan",
    "observer": "yellow",
    "powerSpawn": "cyan",
    "extractor": "cyan",
    "terminal": "yellow",
    "lab": "#d500ff",
    "container": "yellow",
    "nuker": "cyan",
    "factory": "yellow"
};
let helpervisual={
    //线性同余随机数
    rnd : function( seed ){
    return ( seed * 9301 + 49297 ) % 233280; //为何使用这三个数?
    },
    // seed 的随机颜色
    randomColor : function (seed){
        seed = parseInt(seed);
        let str = "12334567890ABCDEF";
        let out = "#";
        for(let i=0;i<6;i++){
            seed = helpervisual.rnd(seed+Game.time%100);
            out+=str[parseInt(seed)%str.length];
        }
        return out
    },
    // 大概消耗1 CPU！ 慎用！
    showRoomStructures : function (roomName,structMap){
        let roomStructs = new RoomArray().init();
        const visual = new RoomVisual(roomName);
        structMap["road"].forEach(e=>roomStructs.set(e[0],e[1],"road"));
        _.keys(CONTROLLER_STRUCTURES).forEach(struct=>{
            if(struct=="road"){
                structMap[struct].forEach(e=>{
                    roomStructs.forNear((x,y,val)=>{
                        if(val =="road"&&((e[0]>=x&&e[1]>=y)||(e[0]>x&&e[1]<y)))visual.line(x,y,e[0],e[1],{color:structuresColor[struct]});
                    },e[0],e[1]);
                    visual.text(structuresShape[struct], e[0],e[1]+0.25, {color: structuresColor[struct],opacity:0.75,fontSize: 7});
                });
            }
            else structMap[struct].forEach(e=>visual.text(structuresShape[struct], e[0],e[1]+0.25, {color: structuresColor[struct],opacity:0.75,fontSize: 7}));
        });
    },
};

let HelperVisual=helpervisual;


class UnionFind{

    constructor(size) {
        this.size  = size;
    }
    init() {
        if(!this.parent)
            this.parent = new Array(this.size);
        for(let i=0;i<this.size;i++){
            this.parent[i]=i;
        }
    }
    find(x) {
        let r = x;
        while (this.parent[r] != r) r = this.parent[r];
        while (this.parent[x] != x) {
            let t = this.parent[x];
            this.parent[x] = r;
            x = t;
        }
        return x;
    }
    union(a,b){
        a = this.find(a);
        b = this.find(b);
        if(a>b)this.parent[a]=b;
        else if(a!=b) this.parent[b]=a;
    }
    same(a,b){
        return this.find(a) ==  this.find(b)
    }
}


global.UnionFind = UnionFind;

let NodeCache= [];
function NewNode(k,x,y,v){
    let t;
    if(NodeCache.length){
        t = NodeCache.pop();
    }else {
        t = {};
    }
    t.k = k;
    t.x = x;
    t.y = y;
    t.v = v;
    return t
}


function ReclaimNode(node){
    if(NodeCache.length<10000)
        NodeCache.push(node);
}


// @ts-ignore
const binary = require('algo_wasm_priorityqueue');   // 读取二进制文件
const wasmModule = new WebAssembly.Module(binary);  // 初始化为wasm类

/**
 * 
 * @typedef {Object} node
 * @property {number} k 优先级实数（可负）
 * 
 * @typedef {{
 *      memory:{
 *          buffer: ArrayBuffer
 *      },
 *      init(is_min:number):void,
 *      push(priorty:number, id:number):void,
 *      pop():void,
 *      top():number,
 *      get_identifier(pointer:number):number,
 *      size():number,
 *      clear():void,
 *      is_empty():boolean
 *  }} cppQueue
 */

class BaseQueue {
    /**
     * 队列元素个数
     * @returns {number}
     */
    size() {
        // @ts-ignore
        return this.instance.size();
    }
    /**
     * 清空整个队列
     */
    clear() {
        // @ts-ignore
        this.instance.clear();
    }
    /**
     * 队列是否为空
     * @returns {boolean} 实际返回值是0或1
     */
    isEmpty() {
        // @ts-ignore
        return !this.instance.is_empty();
    }
}

/**
 *  c++优先队列
 *  最大容量 131072 个元素（2的17次方）
 *  每个元素是带有priority属性的任意对象
 *  连续pop 100k个元素时比js队列快 80% 以上，元素个数少时比js快 5~10 倍
 */
class PriorityQueue extends BaseQueue {
    /**
     * @param {boolean} isMinRoot 优先级方向，true则pop()时得到数字最小的，否则pop()出最大的
     */
    constructor(isMinRoot=false) {
        super();
        /**@type {cppQueue} */
        let instance;
        /**@type {node[]} */
        let cache = [];

        const imports = {   // 把wasm类实例化需要的接口函数
            env: {
                emscripten_notify_memory_growth() {
                }
            },
            wasi_snapshot_preview1: {
                proc_exit: () => { }
            }
        };
        // @ts-ignore
        instance = new WebAssembly.Instance(wasmModule, imports).exports;   // 实例化
        instance.init(+!!isMinRoot);  // !!转化为boolean, +转为数字

        /**
         * @param {node} node 
         */
        this.push = (node) => {
            try {
                instance.push(node.k, cache.length);
                cache.push(node);
            } catch (e) {
                if (e instanceof TypeError) {
                    throw e;
                } else {
                    throw Error(`priorityQueue is full.\n\t Current size is ${instance.size()}, buffer length is ${instance.memory.buffer.byteLength * 2 / 1024}KB.`);
                }
            }
        };
        /** 
         *  @returns {node|undefined}
         */
        this.pop = () => {
            if (instance.size() > 0) {
                let pointer = instance.top();
                let id = instance.get_identifier(pointer);
                let node = cache[id];
                instance.pop();
                // @ts-ignore
                cache[id] = undefined;
                return node;
            } else {
                return undefined;
            }
        };
        /**
         *  @returns {node|undefined}
         */
        this.top = () => {
            if (instance.size() > 0) {
                let pointer = instance.top();
                return cache[instance.get_identifier(pointer)];
            } else {
                return undefined;
            }
        };
        /**
         *  @returns {undefined}
         */
        this.whileNoEmpty = (func) => {
            while (!this.isEmpty()){
                let node = this.pop();
                func(node);
                ReclaimNode(node);
            }
        };

        Object.defineProperty(this, 'instance', {   // 不想被枚举到
            value: instance
        });
    }
    /**
     *  把节点插入队列
     * @param {node} node 待插入对象，至少含有priority:k属性
     */
    push(node) { }
    /** 
     *  查看顶端节点，空队列返回undefined
     *  @returns {node|undefined}
     */
    top() { return }
    /**
     *  取出顶端节点，空队列返回undefined
     *  @returns {node|undefined}
     */
    pop() { return }
}

global.PriorityQueue = PriorityQueue;
global.NewNode = NewNode;
global.ReclaimNode = ReclaimNode;
// module.exports = {
//     PriorityQueue: PriorityQueue
// }


let RoomArray_proto= {
    exec(x,y,val){
        let tmp = this.arr[x*50+y];
        this.set(x,y,val);
        return tmp
    },
    get(x,y){
        return this.arr[x*50+y];
    },
    set(x,y,value){
        this.arr[x*50+y]=value;
    },
    init(){
        if(!this.arr)
            this.arr = new Array(50*50);
        for(let i=0;i<2500;i++){
            this.arr[i]=0;
        }
        return this;
    },
    forEach(func){
        for(let y = 0; y < 50; y++) {
            for(let x = 0; x < 50; x++) {
                func(x,y,this.get(x,y));
            }
        }
    },
    for4Direction(func,x,y,range=1){
        for(let e of [[1,0],[-1,0],[0,1],[0,-1]]){
            let xt=x+e[0];
            let yt=y+e[1];
            if(xt>=0&&yt>=0&&xt<=49&&yt<=49)
                func(xt,yt,this.get(xt,yt));
        }
    },
    forNear(func,x,y,range=1){
        for(let i=-range;i<=range;i++){
            for(let j=-range;j<=range;j++){
                let xt=x+i;
                let yt=y+j;
                if((i||j)&&xt>=0&&yt>=0&&xt<=49&&yt<=49)
                    func(xt,yt,this.get(xt,yt));
            }
        }
    },
    forBorder(func,range=1){
        for(let y = 0; y < 50; y++) {
            func(0,y,this.get(0,y));
            func(49,y,this.get(49,y));
        }
        for(let x = 1; x < 49; x++) {
            func(x,0,this.get(x,0));
            func(x,49,this.get(x,49));
        }
    },
    initRoomTerrainWalkAble(roomName){
        let terrain = new Room.Terrain(roomName);
        this.forEach((x,y)=> this.set(x,y, terrain.get(x,y)==1?0:terrain.get(x,y)==0?1:2));
    }
};
class RoomArray {
    constructor(){
        this.__proto__ = RoomArray_proto;
    }
}


global.minPlaneCnt = 140; // 内部布局最小面积！ 试过了，140是 基本上最低配置了

let visited = new RoomArray();
let roomWalkable = new RoomArray();
let nearWall = new RoomArray();
let routeDistance = new RoomArray();
let roomObjectCache = new RoomArray();

let nearWallWithInterpolation= new RoomArray();
let interpolation = new RoomArray();

let queMin = new PriorityQueue(true);
let queMin2 = new PriorityQueue(true);
let startPoint = new PriorityQueue(true);

let unionFind = new UnionFind(50*50);

/**
 * controller mineral source posList
 */
let objects = [];

let pro={
    /**
     * https://www.bookstack.cn/read/node-in-debugging/2.2heapdump.md
     * 防止内存泄漏！！！！
     * 闭包太多，改不动了
     */
    init  (){
        visited = new RoomArray();
        roomWalkable = new RoomArray();
        nearWall = new RoomArray();
        routeDistance = new RoomArray();

        nearWallWithInterpolation= new RoomArray();
        interpolation = new RoomArray();
        roomObjectCache = new RoomArray();

        queMin = new PriorityQueue(true);
        queMin2 = new PriorityQueue(true);
        startPoint = new PriorityQueue(true);

        unionFind = new UnionFind(50*50);


        visited.init();
        nearWall.init();
        routeDistance.init();
        roomWalkable.init();

        nearWallWithInterpolation.init();
        interpolation.init();
        roomObjectCache.init();
        unionFind.init();

        queMin.clear();
        queMin2.clear();
        startPoint.clear();
    },
    /**
     * 防止内存泄漏！！！！
     */
    dismiss (){
        visited = null;
        roomWalkable = null;
        nearWall = null;
        routeDistance = null;
        roomObjectCache = null;

        nearWallWithInterpolation= null;
        interpolation = null;

        queMin = null;
        queMin2 = null;
        startPoint = null;

        unionFind = null;
        objects= [];
    },
    /**
     * 计算区块的最大性能指标 ，性能消耗的大头！
     * 优化不动了
     */
    getBlockPutAbleCnt (roomWalkable,visited,queMin,unionFind,tarRoot,putAbleCacheMap,AllCacheMap){
        if(putAbleCacheMap[tarRoot])return [putAbleCacheMap[tarRoot],AllCacheMap[tarRoot]]
        // let t = Game.cpu.getUsed() //这很吃性能，但是是必须的
        let roomManor = routeDistance;
        roomManor.init();
        roomManor.forEach((x, y, val)=>{if(tarRoot==unionFind.find(x*50+y)){roomManor.set(x,y,1);}});
        roomManor.forEach((x, y, val)=>{
            if(val){
                let manorCnt = 0;
                let wallCnt = 0;
                roomManor.for4Direction((x1,y1,val1)=>{
                    if(val1)manorCnt+=1;
                    if(!roomWalkable.get(x1,y1))wallCnt+=1;
                },x,y);
                if(manorCnt==1&&wallCnt == 0)roomManor.set(x,y,0);
            }
        });
        let dfsMoreManor = function (x,y,val){
            if(!val&&roomWalkable.get(x,y)){
                let manorCnt = 0;
                let wallCnt = 0;
                roomManor.for4Direction((x1,y1,val1)=>{
                    if(val1)manorCnt+=1;
                    if(!roomWalkable.get(x1,y1))wallCnt+=1;
                },x,y);
                if(manorCnt>=2||manorCnt==1&&wallCnt>=2){
                    roomManor.set(x,y,1);
                    roomManor.for4Direction((x1,y1,val1)=>{
                        dfsMoreManor(x1,y1,val1);
                    },x,y);
                }
            }
        };
        roomManor.forEach((x, y, val)=>{dfsMoreManor(x,y,val);});
        roomWalkable.forBorder((x,y,val)=>{
            if(val){
                roomManor.forNear((x,y,val)=>{
                    roomManor.set(x,y,0);
                },x,y);
                roomManor.set(x,y,0);
            }
        });

        let innerPutAbleList = [];
        let AllCacheList = [];


            // &&!roomObjectCache.get(x,y)
        visited.init();/*
        roomWalkable.forEach((x, y, val)=>{
            if(!roomManor.get(x,y)||roomObjectCache.get(x,y)) {
                // const visual = new RoomVisual("W3N6");
                // if(roomObjectCache.get(x,y))visual.text(val&&!roomObjectCache.get(x,y)?-4:-1, x,y+0.25, {color: 'red',opacity:0.99,font: 7})
                // queMin.push(NewNode(val&&!roomObjectCache.get(x,y)?-4:-1,x,y));
                let innerWall = false //在墙上的时候要退一格子
                if(roomObjectCache.get(x,y)){
                    roomManor.forNear((x,y,val)=>{if(!val&&roomWalkable.get(x,y))innerWall=true},x,y)
                }
                queMin.push(NewNode(val?((roomObjectCache.get(x,y)&&!innerWall)?-1:-4):-1,x,y));
                // visited.set(x,y,1) 这里不能设置visited 因为 -4 和-1 优先级不同 如果 -4距离和-1比较，-1会抢走-4 导致 rangeAttack打得到
            }
        })*/

        roomWalkable.forEach((x, y, val)=>{
            if(!roomManor.get(x,y)) {
                queMin.push(NewNode(val?-4:-1,x,y));
                // visited.set(x,y,1) 这里不能设置visited 因为 -4 和-1 优先级不同 如果 -4距离和-1比较，-1会抢走-4 导致 rangeAttack打得到
            }
        });

        // let t = Game.cpu.getUsed() //这很吃性能，真的优化不动了

        queMin.whileNoEmpty(nd=>{
            let func = function (x,y,val){
                let item = NewNode(nd.k+2,x,y);
                if(!visited.exec(x,y,1)){
                    queMin.push(NewNode(nd.k+1,x,y));
                    if(roomManor.get(x,y)){
                        if(nd.k+1>=0&&val){
                            innerPutAbleList.push(item);
                            // visual.text(nd.k+2, x,y+0.25, {color: 'red',opacity:0.99,font: 7})
                        }
                        if(val)
                            AllCacheList.push(item);
                    }
                }
            };
            visited.set(nd.x,nd.y,1);
            if(nd.k>=-1)
                roomWalkable.for4Direction(func,nd.x,nd.y);
            else
                roomWalkable.forNear(func,nd.x,nd.y);
        });

        // console.log(Game.cpu.getUsed()-t)

        putAbleCacheMap[tarRoot] = innerPutAbleList;
        AllCacheMap[tarRoot] = AllCacheList;
        return [putAbleCacheMap[tarRoot],AllCacheMap[tarRoot]]
    },
    /**
     * 插值，计算区块的预处理和合并需求
     * @param roomName
     */
    computeBlock (roomName){
        new RoomVisual(roomName);

        roomWalkable.initRoomTerrainWalkAble(roomName);
        roomWalkable.initRoomTerrainWalkAble(roomName);

        //计算距离山体要多远
        roomWalkable.forEach((x,y,val)=>{if(!val){queMin.push(NewNode(0,x,y));visited.set(x,y,1);}});
        queMin.whileNoEmpty(nd=>{
            roomWalkable.for4Direction((x,y,val)=>{
                if(!visited.exec(x,y,1)&&val){
                    queMin.push(NewNode(nd.k+1,x,y));
                }
            },nd.x,nd.y);
            nearWall.exec(nd.x,nd.y,nd.k);
        });

        //距离出口一格不能放墙
        roomWalkable.forBorder((x,y,val)=>{
            if(val){
                roomWalkable.forNear((x,y,val)=>{
                    if(val){
                        // roomWalkable.set(x,y,0);
                        nearWall.set(x,y,50);
                        queMin.push(NewNode(0,x,y));
                        // visited.set(x,y,1)
                    }
                },x,y);
                // roomWalkable.set(x,y,0);
                queMin.push(NewNode(0,x,y));
                nearWall.set(x,y,50);
                // visited.set(x,y,1)
            }
        });

        let roomPutAble = routeDistance;
        roomPutAble.initRoomTerrainWalkAble(roomName);
        roomWalkable.forBorder((x,y,val)=>{
            if(val){
                roomWalkable.forNear((x,y,val)=>{
                    if(val){
                        roomPutAble.set(x,y,0);
                    }
                },x,y);
                roomPutAble.set(x,y,0);
            }
        });
        // 计算 控制器，矿物的位置
        let getObjectPos =function(x,y,struct){
            let put = false;
            let finalX = 0;
            let finalY = 0;
            roomPutAble.for4Direction((x,y,val)=>{
                if(val&&!put&&!roomObjectCache.get(x,y)){
                    finalX = x;
                    finalY = y;
                    put = true;
                }
            },x,y);
            roomPutAble.forNear((x,y,val)=>{
                if(val&&!put&&!roomObjectCache.get(x,y)){
                    finalX = x;
                    finalY = y;
                    put = true;
                }
            },x,y);
            roomObjectCache.set(finalX,finalY,struct);
            return [finalX,finalY]
        };
        for(let i=0;i<objects.length;i++){
            let pos = objects[i];
            //container 位置
            let p = getObjectPos(pos.x,pos.y,"container");

            // link 位置
            if(i!=1){
                let linkPos = getObjectPos(p[0],p[1],"link");
                roomObjectCache.link = roomObjectCache.link || [];
                roomObjectCache.link.push(linkPos); // link controller 然后是  source
            }else {
                roomObjectCache.extractor = [[pos.x,pos.y]];
            }
            roomObjectCache.container = roomObjectCache.container || [];
            if(i!=1)roomObjectCache.container.unshift(p); //如果是 mineral 最后一个
            else roomObjectCache.container.push(p);
        }

        //插值，这里用拉普拉斯矩阵，对nearWall 插值 成 nearWallWithInterpolation
        nearWall.forEach((x,y,val)=>{
            let value = -4*val;
            nearWall.for4Direction((x,y,val)=>{
                value += val;
            },x,y);
            interpolation.set(x,y,value);
            if(value>0)value=0;
            if(val&&roomWalkable.get(x,y))nearWallWithInterpolation.set(x,y,val+value*0.1);
        });


        // 计算距离出口多远
        visited.init();
        routeDistance.init();
        queMin.whileNoEmpty(nd=>{
            roomWalkable.forNear((x,y,val)=>{
                if(!visited.exec(x,y,1)&&val){
                    queMin.push(NewNode(nd.k+1,x,y));
                }
            },nd.x,nd.y);
            routeDistance.set(nd.x,nd.y,nd.k);
        });

        // 对距离的格子插入到队列 ，作为分开的顺序
        routeDistance.forEach((x,y,val)=>{
            if(!roomWalkable.get(x,y))return
            if(val)startPoint.push(NewNode(-val,x,y));
        });


        let sizeMap = {};
        let posSeqMap = {};

        // 分块，将地图分成一小块一小块
        visited.init();
        for(let i=0;i<100000;i++){
            if(startPoint.isEmpty())break;
            let cnt = 0;
            // let color = randomColor(i)
            let nd = startPoint.pop();
            let currentPos = nd.x*50+nd.y;
            let posSeq = [];

            //搜索分块
            let dfsFindDown = function (roomArray,x,y){
                let currentValue = roomArray.get(x,y);
                if(!visited.exec(x,y,1)){
                    roomArray.for4Direction((x1,y1,val)=>{
                        if(val&&(x1==x||y1==y) &&val<currentValue){
                            dfsFindDown(roomArray,x1,y1);
                        }
                    },x,y);
                    cnt++;
                    // visual.circle(x,y, {fill: color, radius: 0.5 ,opacity : 0.5})
                    let pos = x*50+y;
                    posSeq.push(pos);
                    unionFind.union(currentPos,pos);
                }
            };

            // 跑到最高点
            let dfsFindUp = function (roomArray,x,y){
                let currentValue = roomArray.get(x,y);
                if(!visited.exec(x,y,1)){
                    roomArray.forNear((x1,y1,val)=>{
                        if(val>currentValue&&currentValue<6){ //加了一点优化，小于时分裂更过
                            dfsFindUp(roomArray,x1,y1);
                        }
                        else if(val&&val<currentValue){
                            dfsFindDown(roomArray,x1,y1);
                        }
                    },x,y);
                    cnt++;
                    // visual.circle(x,y, {fill: color, radius: 0.5 ,opacity : 0.5})
                    let pos = x*50+y;
                    posSeq.push(pos);
                    unionFind.union(currentPos,pos);
                }
            };
            dfsFindUp(nearWallWithInterpolation,nd.x,nd.y);

            //记录每一块的位置和大小 以 并查集的根节点 作为记录点
            if(cnt>0){
                let pos = unionFind.find(currentPos);
                // queMin.push({k:cnt,v:pos})
                queMin.push(NewNode(cnt,0,0,pos));
                sizeMap[pos] = cnt;
                posSeqMap[pos] = posSeq;
            }
        }

        // 将出口附近的块删掉
        roomWalkable.forBorder((x,y,val)=>{
            if(val){
                roomWalkable.forNear((x,y,val)=>{
                    if(val){
                        let pos = unionFind.find(x*50+y);
                        if(sizeMap[pos]) delete sizeMap[pos];
                    }
                },x,y);
                let pos = unionFind.find(x*50+y);
                if(sizeMap[pos]) delete sizeMap[pos];
            }
        });

        let putAbleCacheMap = {};
        let allCacheMap = {};
        // let i = 0
        // 合并小块成大块的
        queMin.whileNoEmpty(nd=>{
            let pos = nd.v;
            if(nd.k != sizeMap[pos])return;// 已经被合并了
            // i++;

            visited.init();
            let nearCntMap={};

            //搜索附近的块
            posSeqMap[pos].forEach(e=>{
                let y = e%50;
                let x = ((e-y)/50);//Math.round
                roomWalkable.forNear((x,y,val)=>{
                    if(val&&!visited.exec(x,y,1)){
                        let currentPos = unionFind.find(x*50+y);
                        if(currentPos == pos)return;
                        // if(i==104)
                        // visual.text(parseInt(1*10)/10, x,y+0.25, {color: "cyan",opacity:0.99,font: 7})
                        let currentSize = sizeMap[currentPos];
                        if(currentSize<300){
                            nearCntMap[currentPos]=(nearCntMap[currentPos]||0)+1;
                        }
                    }
                },x,y);
            });

            let targetPos = undefined;
            let nearCnt = 0;
            let maxRatio = 0;

            // 找出合并附近最优的块
            _.keys(nearCntMap).forEach(currentPos=>{
                let currentRatio = nearCntMap[currentPos]/Math.sqrt(Math.min(sizeMap[currentPos],nd.k));//实际/期望
                if( currentRatio == maxRatio ? sizeMap[currentPos]<sizeMap[targetPos]:currentRatio > maxRatio){
                    targetPos = currentPos;
                    maxRatio = currentRatio;
                    nearCnt = nearCntMap[currentPos];
                }
            });
            _.keys(nearCntMap).forEach(currentPos=>{
                if(nearCnt < nearCntMap[currentPos]){
                    targetPos = currentPos;
                    nearCnt = nearCntMap[currentPos];
                }
            });
            let minSize = sizeMap[targetPos];
            let cnt = nd.k+minSize;
            // let nearRatio =nearCntMap[targetPos]/allNearCnt;

            let targetBlockPutAbleCnt = 0;
            let ndkBlockPutAbleCnt = 0;
            if(minSize>minPlaneCnt)
                targetBlockPutAbleCnt = pro.getBlockPutAbleCnt(roomWalkable,visited,queMin2,unionFind,targetPos,putAbleCacheMap,allCacheMap)[0].length;
            if(nd.k>minPlaneCnt)
                ndkBlockPutAbleCnt = pro.getBlockPutAbleCnt(roomWalkable, visited, queMin2, unionFind, nd.v,putAbleCacheMap,allCacheMap)[0].length;

            // if(targetBlockPutAbleCnt||ndkBlockPutAbleCnt)clog(targetBlockPutAbleCnt,ndkBlockPutAbleCnt)
            // 打印中间变量
            // if(targetPos&&cnt>50&&(targetBlockPutAbleCnt||ndkBlockPutAbleCnt)){
            //     let y = pos%50
            //     let x = Math.round((pos-y)/50)
            //     let y1 = targetPos%50
            //     let x1 = Math.round((targetPos-y1)/50)
            //     visual.line(x,y,x1,y1)
            //     // visual.text(nd.k+"+"+minSize+"="+cnt, (x+x1)/2,(y+y1)/2-0.25, {color: "red",opacity:0.99,font: 7})
            //     // visual.text(allNearCnt+"_"+nearCntMap[targetPos]+" "+nearCnt+" "+parseInt(nearCnt/Math.sqrt(Math.min(minSize,nd.k))*100)/100+" "+parseInt(maxRatio-Math.sqrt(nd.k)/12*100)/100, (x+x1)/2,(y+y1)/2+0.25, {color: "yellow",opacity:0.99,font: 7})
            //     visual.text(parseInt(targetBlockPutAbleCnt*100)/100+" "+parseInt(ndkBlockPutAbleCnt*100)/100, (x+x1)/2,(y+y1)/2+0.25, {color: "yellow",opacity:0.99,font: 7})
            // }

            // if(targetPos&&((cnt<=250&&maxRatio>0.7)||(cnt<=300&&maxRatio>0.8)||(cnt<=350&&maxRatio>0.9)||(maxRatio>1&&cnt<400)||nd.k<=10)){//||maxRatio>1.5
            // if(targetPos&&(maxRatio-cnt/500>0.2&&cnt<400)){//||maxRatio>1.5

            // cnt = targetBlockPutAbleCnt+ndkBlockPutAbleCnt;
            // 合并
            if(targetPos&&Math.max(targetBlockPutAbleCnt,ndkBlockPutAbleCnt)<minPlaneCnt){//&&(maxRatio-Math.sqrt(cnt)/20>=0||(nearRatio>0.7&&nd.k<100))
            // if(targetPos&&(cnt<300||Math.min(nd.k,minSize)<150)&&(maxRatio-Math.sqrt(cnt)/20>=0||Math.max(nd.k,minSize)<200||(nearRatio>0.7&&nd.k<100))){//*Math.sqrt(nearRatio)


                unionFind.union(pos,targetPos);
                nd.v = unionFind.find(pos);

                if(pos != nd.v) delete sizeMap[pos];
                else delete sizeMap[targetPos];

                nd.k = cnt;
                sizeMap[nd.v] = cnt;
                posSeqMap[nd.v] = posSeqMap[targetPos].concat(posSeqMap[pos]);
                delete putAbleCacheMap[nd.v];
                delete putAbleCacheMap[targetPos];
                if(pos != nd.v) delete posSeqMap[pos];
                else delete posSeqMap[targetPos];
                queMin.push(NewNode(nd.k,nd.x,nd.y,nd.v));
            }

        });
        // 打印结果

        // const visual = new RoomVisual(roomName);
        // _.keys(sizeMap).forEach(e=>{
        //     let y = e%50
        //     let x = ((e-y)/50)//Math.round
        //     let color = "red"
        //     let cnt = pro.getBlockPutAbleCnt(roomWalkable,visited,queMin2,unionFind,e,putAbleCacheMap).length
        //     pro.getBlockPutAbleCnt(roomWalkable,visited,queMin2,unionFind,e,putAbleCacheMap).forEach(t=>{
        //         visual.circle(t.x, t.y, {fill: randomColor(e), radius: 0.5 ,opacity : 0.35})
        //     })
        //     // let cnt = sizeMap[e]
        //     if(sizeMap[e]>0)visual.text(parseInt(cnt*10)/10, x,y+0.25, {color: color,opacity:0.99,font: 7})
        // })

        // roomWalkable.forEach((x, y, val)=>{if(val>0&&sizeMap[unionFind.find(x*50+y)]>0)visual.circle(x, y, {fill: randomColor(unionFind.find(x*50+y)), radius: 0.5 ,opacity : 0.15})})


        // 打印中间变量
        // nearWallWithInterpolation.forEach((x, y, val)=>{if(val>0)visual.circle(x, y, {fill: "#ff9797", radius: 0.5 ,opacity : 0.05*val+0.01})})
        // nearWall.forEach((x, y, val)=>{if(val)visual.text(parseInt(val*10)/10, x,y+0.25, {color: "red",opacity:0.5,font: 7})})

        return [unionFind,sizeMap,roomWalkable,nearWall,putAbleCacheMap,allCacheMap]

    },
    /**
     * 计算 分布图
     * 计算建筑的位置
     * @param roomName,
     * @param points [flagController,flagMineral,flagSourceA,flagSourceB]
     * @return result { roomName:roomName,storagePos:{x,y},labPos:{x,y},structMap:{ "rampart" : [[x1,y1],[x2,y2] ...] ...} }
     */
    computeManor (roomName,points){
        pro.init();
        for(let p of points){
            if(p.pos&&p.pos.roomName==roomName)objects.push(p.pos);
        }
        // const visual = new RoomVisual(roomName);
        let blockArray = pro.computeBlock(roomName);
        let unionFind = blockArray[0];
        let sizeMap = blockArray[1];
        let wallMap = {};
        let roomWalkable = blockArray[2];
        let nearWall = blockArray[3];
        let putAbleCacheMap = blockArray[4];
        let allCacheMap = blockArray[5];

        let roomManor = interpolation;
        let roomStructs = nearWallWithInterpolation;


        roomManor.init();
        roomStructs.init();

        // let closeToWall = new RoomArray()
        nearWall.init();

        // let queMin = new PriorityQueue(true)
        queMin.clear();
        // let visited = new RoomArray()

        let finalPos = undefined;
        let wallCnt = 1e9;
        let innerPutAbleList = [];

        let centerX = undefined;
        let centerY = undefined;
        _.keys(sizeMap).forEach(pos=>{
            // if(sizeMap[pos]<150)return
            pro.getBlockPutAbleCnt(roomWalkable, visited, queMin, unionFind, pos,putAbleCacheMap,allCacheMap);
            let currentPutAbleList = putAbleCacheMap[pos];
            let allList = allCacheMap[pos];
            if(currentPutAbleList.length<minPlaneCnt)return

            wallMap[pos] = [];

            visited.init();
            roomWalkable.forBorder((x,y,val)=>{if(val){queMin.push(NewNode(0,x,y));visited.set(x,y,1);}});

            let roomManor = routeDistance; //当前的Manor
            roomManor.init();
            allList.forEach(e=>{
                roomManor.set(e.x,e.y,1);
            });
            // currentPutAbleList.forEach(e=>visual.text(e.k, e.x,e.y+0.25, {color: 'red',opacity:0.99,font: 7}))

            queMin.whileNoEmpty(nd=>{
                if(!roomManor.get(nd.x,nd.y))
                roomWalkable.forNear((x,y,val)=>{
                    if(!visited.exec(x,y,1)&&val){
                        if(!roomManor.get(x,y))
                            queMin.push(NewNode(nd.k+1,x,y));
                        else {
                            wallMap[pos].push(NewNode(0,x,y));
                            // visual.text('X', x,y+0.25, {color: 'red',opacity:0.99,font: 7})
                        }
                    }
                },nd.x,nd.y);
            });

            // wallMap[pos].forEach(xy=>queMin.push(NewNode(0,xy.x,xy.y)))

            let currentInnerPutAbleList = currentPutAbleList;

            let maxDist = 0;
            let filter2 = currentInnerPutAbleList.filter(e=>e.k>2);
            if (filter2.length < 30) {
                filter2.forEach(a=>{
                    filter2.forEach(b=>{
                        maxDist = Math.max(maxDist,Math.abs(a.x-b.x)+Math.abs(a.y-b.y));
                    });
                });
            }

            let currentWallCnt = wallMap[pos].length;
            // {
            //     let y = pos%50
            //     let x = ((pos-y)/50)//Math.round
            //     visual.text(parseInt((allList.length)*10)/10, x,y, {color: "yellow",opacity:0.99,font: 7})
            //     visual.text(parseInt((currentPutAbleList.length)*10)/10, x,y+0.5, {color: "red",opacity:0.99,font: 7})
            //     visual.text(parseInt((currentInnerPutAbleList.length)*10)/10, x,y+1, {color: "red",opacity:0.99,font: 7})
            // }
            if(minPlaneCnt<currentPutAbleList.length&&wallCnt>currentWallCnt&&(currentInnerPutAbleList.filter(e=>e.k>1).length>30||maxDist>5)){
                innerPutAbleList = currentInnerPutAbleList;
                wallCnt = currentWallCnt;
                finalPos = pos;
                centerX = currentPutAbleList.map(e=>e.x).reduce((a,b)=>a+b)/currentPutAbleList.length;
                centerY = currentPutAbleList.map(e=>e.y).reduce((a,b)=>a+b)/currentPutAbleList.length;
            }

            // allCacheMap[pos].forEach(t=>{
            //     visual.circle(t.x, t.y, {fill: randomColor(pos), radius: 0.5 ,opacity : 0.15})
            // })
        });

        if(!putAbleCacheMap[finalPos])
            return

        let walls = wallMap[finalPos];


        roomManor.init();
        allCacheMap[finalPos].forEach(e=>{
            roomManor.set(e.x,e.y,-1);
        });
        innerPutAbleList.forEach(e=>{
            roomManor.set(e.x,e.y,e.k);
        });

        // visited.init()
        // roomWalkable.forEach((x, y, val)=>{if(!roomManor.get(x,y)){queMin.push(NewNode(val?-3:-1,x,y));visited.set(x,y,1)}})



        let storageX = 0;
        let storageY = 0;
        let storageDistance = 100;

        // innerPutAbleList.forEach(e=>visual.text(e.k, e.x,e.y+0.25, {color: 'red',opacity:0.99,font: 7}))
        innerPutAbleList.filter(e=>e.k>2).forEach(e=>{
            let x =e.x;
            let y =e.y;
            let detX= centerX-x;
            let detY= centerY-y;
            let distance = Math.sqrt(detX*detX+detY*detY);
            if(storageDistance>distance){
                storageDistance = distance;
                storageX = x;
                storageY = y;
            }
        });


        if(Game.flags.storagePos){
            storageX = Game.flags.storagePos.pos.x;
            storageY = Game.flags.storagePos.pos.y;
        }

        let labX = 0;
        let labY = 0;
        let labDistance = 1e5;
        innerPutAbleList.filter(e=>e.k>4).forEach(e=>{
            let x =e.x;
            let y =e.y;
            let detX= centerX-x;
            let detY= centerY-y;
            let distance = Math.sqrt(detX*detX+detY*detY);

            if(labDistance>distance&&Math.abs(x-storageX)+Math.abs(y-storageY)>5){
                labDistance = distance;
                labX = x;
                labY = y;
            }
        });

        roomManor.forEach((x,y,val)=>{
            if(val>=2){
                // if(roomManor.get(x,y)>0&&Math.abs(x-storageX)+Math.abs(y-storageY)>2)
                    // visual.text(val, x,y+0.25, {color: 'cyan',opacity:0.99,font: 7})
                let distance = Math.sqrt(Math.pow(centerX-x-0.5,2)+Math.pow(centerY-y-0.5,2));
                if(labDistance<=distance) return;
                let checkCnt = 0;
                let check=function (x,y){
                    if(roomManor.get(x,y)>0&&Math.abs(x-storageX)+Math.abs(y-storageY)>2){
                        checkCnt+=1;
                    }
                };
                for(let i=-1;i<3;i++)
                    for(let j=-1;j<3;j++)
                        check(x+i,y+j);
                if(checkCnt==16){
                    labDistance = distance;
                    labX = x;
                    labY = y;
                }
            }
        });


        // visual.text("C", centerX,centerY+0.25, {color: 'green',opacity:0.99,font: 7})
        // visual.text("S", storageX,storageY+0.25, {color: 'blue',opacity:0.99,font: 7})
        // visual.text("L", labX+0.5,labY+0.75, {color: 'blue',opacity:0.99,font: 7})
        // clog(roomName)

        // clog(roomName,storageX,storageY,labX,labY,innerPutAbleList.length,wallCnt,finalPos)
        // clog(innerPutAbleList.filter(e=>e.k==1).length)

        // _.keys(sizeMap).forEach(e=>{
        //     let y = e%50
        //     let x = ((e-y)/50)//Math.round
        //     let color = "red"
        //     if(sizeMap[e]>0)visual.text(parseInt(sizeMap[e]*10)/10, x,y+1+0.25, {color: color,opacity:0.99,font: 7})
        // })

        // CONTROLLER_STRUCTURES: {
        //     "spawn": {0: 0, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 2, 8: 3},
        //     "extension": {0: 0, 1: 0, 2: 5, 3: 10, 4: 20, 5: 30, 6: 40, 7: 50, 8: 60},
        //     "link": {1: 0, 2: 0, 3: 0, 4: 0, 5: 2, 6: 3, 7: 4, 8: 6},
        //     "road": {0: 2500, 1: 2500, 2: 2500, 3: 2500, 4: 2500, 5: 2500, 6: 2500, 7: 2500, 8: 2500},
        //     "constructedWall": {1: 0, 2: 2500, 3: 2500, 4: 2500, 5: 2500, 6: 2500, 7: 2500, 8: 2500},
        //     "rampart": {1: 0, 2: 2500, 3: 2500, 4: 2500, 5: 2500, 6: 2500, 7: 2500, 8: 2500},
        //     "storage": {1: 0, 2: 0, 3: 0, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1},
        //     "tower": {1: 0, 2: 0, 3: 1, 4: 1, 5: 2, 6: 2, 7: 3, 8: 6},
        //     "observer": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 1},
        //     "powerSpawn": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 1},
        //     "extractor": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 1, 7: 1, 8: 1},
        //     "terminal": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 1, 7: 1, 8: 1},
        //     "lab": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 3, 7: 6, 8: 10},
        //     "container": {0: 5, 1: 5, 2: 5, 3: 5, 4: 5, 5: 5, 6: 5, 7: 5, 8: 5},
        //     "nuker": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 1},
        //     "factory": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 1, 8: 1}
        // }

        // nearWall.forEach((x, y, val)=>{if(val>2&&finalPos==unionFind.find(x*50+y))visual.text(nearWall.get(x,y),x, y+0.5, {color: "red",opacity:0.99,font: 7})})

        /**
         * 这里开始计算布局！
         * @type {{}}
         */
        let structMap = {};
        _.keys(CONTROLLER_STRUCTURES).forEach(e=>structMap[e] = []);

        // 资源点布局
        structMap["link"] = roomObjectCache.link;
        structMap["container"] = roomObjectCache.container;
        structMap["extractor"] = roomObjectCache.extractor;
        //中心布局
        structMap["storage"] .push([storageX-1,storageY]);
        structMap["terminal"] .push([storageX,storageY+1]);
        structMap["factory"] .push([storageX+1,storageY]);
        structMap["link"] .push([storageX,storageY-1]);
        for(let i=-1;i<=1;i++){
            for(let j=-1;j<=1;j++) {
                structMap["road"].push([storageX+i+j,storageY+i-j]); //仿射变换 [sin,cos,cos,-sin]
            }
        }
        // 这里修改lab布局
        let labs = [
            "☢☢-☢",
            "☢-☢-",
            "-☢-☢",
            "☢-☢☢"
            // "☢☢☢☢☢",
            // "-----",
            // "☢☢☢☢☢"
        ];
        let labChangeDirection = false;
        if ((storageX - labX) * (storageY - labY) < 0) {
            labChangeDirection = true;
        }

        let vis = {};
        for(let i=0;i<2;i++){
            for(let j=0;j<2;j++){
                vis[i+"_"+j] = 1; // 优先放置中间的label
                let jj = labChangeDirection?j:1-j;
                let structs = labs[i+1].charAt(j+1);
                if(structs == '☢')
                    structMap["lab"].push([labX+i,labY+jj]);
                else
                    structMap["road"].push([labX+i,labY+jj]);
            }
        }

        for(let i=-1;i<3;i++){
            for(let j=-1;j<3;j++){
                if(vis[i+"_"+j])continue;
                let jj = labChangeDirection?j:1-j;
                let structs = labs[i+1].charAt(j+1);
                if(structs == '☢')
                    structMap["lab"].push([labX+i,labY+jj]);
                else
                    structMap["road"].push([labX+i,labY+jj]);
            }
        }

        walls.forEach(e=>structMap["rampart"].push([e.x,e.y]));

        _.keys(CONTROLLER_STRUCTURES).forEach(struct=>structMap[struct].forEach(e=>roomStructs.set(e[0],e[1],struct)));

        structMap["road"].forEach(e=>roomStructs.set(e[0],e[1],1));
        //设置权值，bfs联通路径！
        let setModel = function (xx,yy){
            let checkAble = (x,y)=> (x>=0&&y>=0&&x<=49&&y<=49)&&roomManor.get(x,y)>0&&!roomStructs.get(x,y);
            for(let i=-1;i<=1;i++){
                for(let j=-1;j<=1;j++) {
                    let x = xx+i+j;
                    let y = yy+i-j;
                    if(checkAble(x,y)){
                        if(i||j){
                            // structMap["road"] .push([x,y]) //仿射变换 [sin,cos,cos,-sin]
                            roomStructs.set(x,y,1);
                        }else {
                            // structMap["spawn"] .push([x,y])
                            roomStructs.set(x,y,12);
                        }
                    }
                }
            }
            for(let e of [[1,0],[-1,0],[0,1],[0,-1]]){
                let x=xx+e[0];
                let y=yy+e[1];
                if(checkAble(x,y)){
                    // structMap["extension"] .push([x,y])
                    roomStructs.set(x,y,8);
                }
            }
        };

        for(let i=0;i<50;i+=4){
            for(let j=0;j<50;j+=4) {
                let x =storageX%4+i;
                let y =storageY%4+j;
                setModel(x,y);
                setModel(x+2,y+2);

            }
        }
        visited.init();
        visited.set(storageX,storageY,1);

        queMin.push(NewNode(1,storageX,storageY));
        let costRoad = routeDistance; //重复使用
        costRoad.init();
        queMin.whileNoEmpty(nd=>{
            roomStructs.forNear((x,y,val)=>{
                if(!visited.exec(x,y,1)&&val>0){
                    queMin.push(NewNode(nd.k+val,x,y));
                }
            },nd.x,nd.y);
            costRoad.set(nd.x,nd.y,nd.k);
            // visual.text(nd.k,nd.x,nd.y+0.25, {color: "pink",opacity:0.99,font: 7})
        });

        structMap["road"].forEach(e=>roomStructs.set(e[0],e[1],"road")); //这里把之前的road覆盖上去防止放在之前里road上了

        costRoad.forEach((x,y,val)=>{
            if(!val)return;
            let minVal =50;
            // let finalX = 0;
            // let finalY = 0;
            costRoad.forNear((x1,y1,val)=>{
                if(minVal>val&&val>0){
                    minVal = val;
                    // finalX = x1
                    // finalY = y1
                }
            },x,y);
            // 方案2 没那么密集
            costRoad.forNear((x1,y1,val)=>{
                if(minVal==val&&val>0){
                    // structMap["road"].push([x1,y1])
                    roomStructs.set(x1,y1,"road");
                }
            },x,y);
            // 方案1 密集
            // structMap["road"].push([finalX,finalY])
            // roomStructs.set(finalX,finalY,"road")
        });

        let spawnPos = [];
        let extensionPos = [];
        roomStructs.forEach((x,y,val)=>{
            if (val > 0) {
                let dist = 100;
                costRoad.forNear((x,y,val)=>{
                    if(val)dist = Math.min(dist,val);
                },x,y);
                // let dist = Math.sqrt(Math.pow(x-storageX,2)+Math.pow(y-storageY,2))
                if(val==12){// 8 && 12 上面有写，注意！！！
                    spawnPos.push([x,y,dist]);
                }
                else {
                    extensionPos.push([x,y,dist]);
                    // visual.text(dist,x, y+0.25, {color: "pink",opacity:0.99,font: 7})
                }
            }
        });
        let cmpFunc=(a,b)=>a[2]==b[2]?(a[1]==b[1]?a[0]-b[0]:a[1]-b[1]):a[2]-b[2];
        spawnPos = spawnPos.sort(cmpFunc);
        extensionPos = extensionPos.sort(cmpFunc);
        let oriStruct = [];
        let putList=[];
        ["spawn","powerSpawn","nuker","tower", "observer"].forEach(struct=>{
            for(let i=0;i<CONTROLLER_STRUCTURES[struct][8];i++){
                oriStruct.push(struct);
            }
        });
        oriStruct.forEach(struct=>{
            let e = spawnPos.shift();
            if(!e) e = extensionPos.shift();
            structMap[struct].push([e[0],e[1]]);
            putList.push([e[0],e[1],struct]);
        });
        extensionPos.push(...spawnPos);
        extensionPos = extensionPos.sort(cmpFunc);
        let extCnt= 60;
        extensionPos.forEach(e=>{
            if(extCnt>0){
                structMap["extension"].push([e[0],e[1]]);
                putList.push([e[0],e[1],"extension"]);
                extCnt-=1;
            }
        });


        // 更新roads
        roomStructs.init();
        _.keys(CONTROLLER_STRUCTURES).forEach(struct=>structMap[struct].forEach(e=>roomStructs.set(e[0],e[1],struct)));
        visited.init();
        structMap["road"].forEach(e=>visited.set(e[0],e[1],1));
        /**
         * 更新最近的roads 但是可能有残缺
         */
        putList.forEach(e=>{
            let x = e[0];
            let y = e[1];
            let minVal =50;
            costRoad.forNear((x1,y1,val)=>{
                if(minVal>val&&val>0){
                    minVal = val;
                }
            },x,y);
            // 方案2 没那么密集
            costRoad.forNear((x1,y1,val)=>{
                if(minVal==val&&val>0){
                    // 找到建筑最近的那个road
                    roomStructs.set(x1,y1,"road");
                }
            },x,y);
        });
        /**
         * 再roads的基础上，对rads进行补全，将残缺的连起来
         */
        roomStructs.forEach((x,y,val)=>{
            if(val == 'link'||val == 'container')return; // 资源点的不要 放路
            if(! val instanceof String||val>-1)return; // 附近有建筑 ，并且不是road
            // visual.text(val,x, y+0.25, {color: "pink",opacity:0.99,font: 7})
            let minVal =50;
            costRoad.forNear((x1,y1,val)=>{
                if(minVal>val&&val>0){
                    minVal = val;
                }
            },x,y);
            // 方案2 没那么密集
            costRoad.forNear((x1,y1,val)=>{
                if(minVal==val&&val>0){
                    // 找到建筑最近的那个road
                    if(!visited.exec(x1,y1,1))structMap["road"].push([x1,y1]);
                }
            },x,y);
        });

        // 处理塔的位置，让塔尽量靠外
        let getRange=function(a,b){
            return Math.max(Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1]))
        };
        let poses = [];
        let types = ["nuker","tower", "observer"];
        types.forEach(type=>{
            structMap[type].forEach(e=>{
                let dis = 0;
                structMap["rampart"].forEach(e_ramp=>{
                    dis += getRange(e_ramp,e);
                });
                poses.push({pos:e,type,dis});
            });
        });
        poses.sort((a,b)=>(a.dis-b.dis));
        
        for(let i=0;i<6;i++){
            if(poses[i].type == "tower")continue;
            for(let j=6;j<poses.length;j++){
                if(poses[j].type != "tower")continue;
                poses[j].type = poses[i].type;
                poses[i].type = "tower";
            }
        }
        types.forEach(type=>{structMap[type] = [];});
        poses.forEach(pos=>{
            structMap[pos.type].push(pos.pos);
        });

        //#region 新的连接外矿方式

        let costs = new PathFinder.CostMatrix;
        let terrain = new Room.Terrain(roomName);
        for(let i=0;i<50;i++){
            for(let j=0;j<50;j++){
                let te = terrain.get(i,j);
                costs.set(i,j,te==TERRAIN_MASK_WALL?255:(te==TERRAIN_MASK_SWAMP?4:2));
            }
        }
        for(let struct of OBSTACLE_OBJECT_TYPES){
            if(structMap[struct]){
                structMap[struct].forEach(e=>{
                    costs.set(e[0],e[1],255);
                });
            }
        }
        structMap["road"].forEach(e=>{
            costs.set(e[0],e[1],1);
        });
        structMap["container"].forEach(e=>{
            let ret = PathFinder.search(
                new RoomPosition(centerX,centerY,roomName),
                {pos:new RoomPosition(e[0],e[1],roomName),range:1}, 
                {
                    roomCallback:()=>{return costs},
                    maxRooms:1
                }
            );
            ret.path.forEach(pos=>{
                if(costs.get(pos.x,pos.y) != 1){
                    structMap['road'].push([pos.x,pos.y]);
                    costs.set(pos.x,pos.y,1);
                }
            });
            
        });
        //#endregion

        //#region 旧的连接外矿道路

        // // 连接外矿的全部道路
        // _.keys(CONTROLLER_STRUCTURES).forEach(struct=>structMap[struct].forEach(e=>roomStructs.set(e[0],e[1],struct)))

        // costRoad.forEach((x,y,val)=>costRoad.set(x,y,100))//初始化100
        // visited.init()
        // queMin.push(NewNode(0,storageX,storageY))//以 storage为中心
        // visited.exec(storageX,storageY,1)
        // queMin.whileNoEmpty(nd=>{
        //     roomStructs.forNear((x,y,val)=>{
        //         let roadCost = roomWalkable.get(x,y);
        //         if(!visited.exec(x,y,1)&&(!val||val=='road'||val=='rampart')&&roadCost){
        //             queMin.push(NewNode(nd.k+(val=='road'?0:roadCost==2?4:2),x,y))
        //         }
        //     },nd.x,nd.y)
        //     costRoad.set(nd.x,nd.y,nd.k)
        //     // visual.text(costRoad.get(nd.x,nd.y),nd.x,nd.y+0.25, {color: "pink",opacity:0.99,font: 7})
        // })

        // // 将dp的位置进行递归回去
        // let border = visited //边界不能放路
        // border.init()
        // visited.forBorder((x,y,val)=>{visited.set(x,y,1)})
        // structMap["container"].forEach(e=>{
        //     let dfsBack = function (x,y){
        //         let minVal =500;
        //         let finalX = 0;
        //         let finalY = 0;
        //         costRoad.forNear((x,y,val)=>{
        //             let struct = roomStructs.get(x,y)
        //             if(minVal>val&&!visited.get(x,y)&&val>=0&&roomWalkable.get(x,y)&&(!struct||struct=='road'||struct=='rampart')) {
        //                 minVal = val
        //                 finalX = x
        //                 finalY = y
        //             }
        //         },x,y)
        //         if(minVal){
        //             if("road"!=roomStructs.exec(finalX,finalY,"road")){
        //                 structMap["road"].push([finalX,finalY]);
        //                 dfsBack(finalX,finalY)
        //             }
        //         }
        //         // visual.text(minVal,finalX,finalY+0.25, {color: "pink",opacity:0.99,font: 7})
        //     }
        //     dfsBack(e[0],e[1])
        //     structMap["road"].forEach(e=>costRoad.set(e[0],e[1],0))
        // })

        //#endregion

        // 可视化部分
        // allCacheMap[finalPos].forEach(t=>{
        //     visual.circle(t.x, t.y, {fill: "#33ff00", radius: 0.5 ,opacity : 0.03})
        // })
        // putAbleList.forEach(t=>{
        //     visual.circle(t.x, t.y, {fill: "#b300ff", radius: 0.5 ,opacity : 0.1})
        // })

        // roomStructs.init()
        // _.keys(CONTROLLER_STRUCTURES).forEach(struct=>structMap[struct].forEach(e=>roomStructs.set(e[0],e[1],struct)))


        // let t = Game.cpu.getUsed()
        // console.log(Game.cpu.getUsed()-t)
        pro.dismiss();

        // HelperVisual.showRoomStructures(roomName,structMap)

        // clog(roomName,structMap["extension"].length,structMap["spawn"].length,wallCnt,innerPutAbleList.length)
        return {
            roomName:roomName,
            // storagePos:{storageX,storageY},
            // labPos:{labX,labY},
            structMap:structMap
        }

    },

};

let ManagerPlanner = pro;
module.exports = {
    run(){
        let roomStructsData = undefined; //放全局变量

        let p = Game.flags.p; // 触发器
        let pa = Game.flags.pa;
        let pb = Game.flags.pb;
        let pc = Game.flags.pc;
        let pm = Game.flags.pm;
        if(p) {
            roomStructsData = ManagerPlanner.computeManor(p.pos.roomName,[pc,pm,pa,pb]);
            Game.flags.p.remove();
        }
        if(roomStructsData){
            //这个有点消耗cpu 不看的时候记得关
            HelperVisual.showRoomStructures(roomStructsData.roomName,roomStructsData.structMap);
        }
    }
};
/*
module.exports = {
    HelperVisual:helpervisual,
    ManagerPlanner:pro,
    
}
*/

function maxTwoNumber(x, y) {
    if (x >= y)
        return x;
    return y;
}
function distanceTwoPoints(pointA, pointB) {
    //return Math.sqrt( (pointA[0]-pointB[0]) **2 + (pointA[1]-pointB[1]) **2 )
    let x = Math.sqrt((pointA[0] - pointB[0]) ** 2);
    //console.log(x);
    let y = Math.sqrt((pointA[1] - pointB[1]) ** 2);
    //console.log(y);
    return maxTwoNumber(x, y);
}
/*
    punto de distancia minima del listPoint un punto 'point' dado
*/
function minDistance(point, listPoint) {
    listPoint[0];
    let disMin = distanceTwoPoints(point, listPoint[0]);
    let index = 0;
    for (let i = 1; i < listPoint.length; ++i) {
        let aux = distanceTwoPoints(point, listPoint[i]);
        if (aux < disMin) {
            disMin = aux;
            listPoint[i];
            index = i;
        }
    }
    //listPoint.splice(index, 1);
    return index;
    //return [pmim[0], pmim[1]];
}
/*
    puntos de distancia 1 de un punto dado a una lista de puntos
*/
function nearPoint(point, listPoint) {
    let near = [];
    for (let i = 0; i < listPoint.length; ++i) {
        if (distanceTwoPoints(point, listPoint[i]) == 1) {
            near.push(i);
        }
    }
    return near;
}
function nearPointOne(point, listPoint) {
    let near;
    for (let i = 0; i < listPoint.length; ++i) {
        if (distanceTwoPoints(point, listPoint[i]) == 1) {
            near = i;
            break;
        }
    }
    return near;
}
function transformRoadToAdjacentList(roadList) {
    let adjacentList = [];
    for (let i = 0; i < roadList.length; ++i) {
        adjacentList.push(nearPoint(roadList[i], roadList));
        console.log(i, nearPoint(roadList[i], roadList));
    }
    console.log(adjacentList);
    return adjacentList;
}
function reconstructPath(beginPoint, endPoint, prev) {
    let path = [];
    for (let at = endPoint; at != -1; at = prev[at]) {
        path.push(at);
    }
    path.reverse();
    if (path[0] == beginPoint) {
        return path;
    }
    return [];
}
function solveBFS(roadList, beginPoint) {
    //initialize visited array
    let visited = Array();
    for (let i = 0; i < roadList.length; ++i) {
        visited.push(false);
    }
    // Use an array as our queue representation:
    let q = new Array();
    visited[beginPoint] = true;
    q.push(beginPoint);
    //save path
    let path = new Array();
    path.push(beginPoint);
    let prev = new Array();
    for (let i = 0; i < roadList.length; ++i) {
        prev.push(-1);
    }
    while (q.length > 0) {
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
function roadPath(roadList, beginPoint, endPoint) {
    let prev = solveBFS(roadList, beginPoint);
    return reconstructPath(beginPoint, endPoint, prev);
}
//get object's ID by roomName, position and structure type
function getId(roomName, pos, structureType) {
    console.log(structureType);
    const position = new RoomPosition(pos[0], pos[1], roomName);
    const object = position.lookFor(structureType);
    return object[0].id;
}

function getPlanningStructurePos(roomName, structureType, index) {
    const pos = Memory['colony'][roomName]['roomPlanning']['model'][structureType][index]['pos'];
    return pos;
}

class TranslatePlanning {
    constructor(mainRoom) {
        this.mainRoom = mainRoom;
    }
    savePlanningModel() {
        let roomStructsData;
        let p = Game.flags.p;
        let pc = Game.flags.pc;
        let pm = Game.flags.pm;
        let pa = Game.flags.pa;
        let pb = Game.flags.pb;
        [pa.pos.x, pa.pos.y];
        [pb.pos.x, pb.pos.y];
        [pc.pos.x, pc.pos.y];
        [pm.pos.x, pm.pos.y];
        if (p) {
            roomStructsData = ManagerPlanner.computeManor(this.mainRoom, [pc, pm, pa, pb]);
            Game.flags.p.remove();
        }
        if (roomStructsData) {
            HelperVisual.showRoomStructures(this.mainRoom, roomStructsData['structMap']);
            Memory['colony'][this.mainRoom]['roomPlanning'] = {};
            //save model
            this.generateModel(roomStructsData['structMap']);
            this.containerReference(roomStructsData['structMap']['container']);
            this.linkReference(roomStructsData['structMap']['link']);
            this.roadReference(roomStructsData['structMap']['road']);
            this.labReference(roomStructsData['structMap']['lab']);
            //let roadList =  utils.transformRoadToAdjacentList( roomStructsData['structMap']['road']);
            return true;
        }
        return false;
    }
    labReference(labList) {
    }
    roadReference(roadList) {
        let roadListAdj = transformRoadToAdjacentList(roadList);
        const spawn0Pos = Memory['colony'][this.mainRoom]['roomPlanning']['model']['spawn'][0]['pos'];
        const posRoadNearSpawn0 = nearPointOne(spawn0Pos, roadList);
        //Spawn0 to source1 path
        const containerSource1Reference = Memory['colony'][this.mainRoom]['roomPlanning']['containerReference']['container_source1'];
        const containerSource1Pos = Memory['colony'][this.mainRoom]['roomPlanning']['model']['container'][containerSource1Reference]['pos'];
        const posRoadNearContainerSource1 = nearPointOne(containerSource1Pos, roadList);
        let spawn0ToSource1 = roadPath(roadListAdj, posRoadNearSpawn0, posRoadNearContainerSource1);
        //Spawn0 to source2 path
        const containerSource2Reference = Memory['colony'][this.mainRoom]['roomPlanning']['containerReference']['container_source2'];
        const containerSource2Pos = Memory['colony'][this.mainRoom]['roomPlanning']['model']['container'][containerSource2Reference]['pos'];
        const posRoadNearContainerSource2 = nearPointOne(containerSource2Pos, roadList);
        let spawn0ToSource2 = roadPath(roadListAdj, posRoadNearSpawn0, posRoadNearContainerSource2);
        //Spawn0 to controller
        const containerControllerReference = Memory['colony'][this.mainRoom]['roomPlanning']['containerReference']['container_controller'];
        const containerControllerPos = Memory['colony'][this.mainRoom]['roomPlanning']['model']['container'][containerControllerReference]['pos'];
        const posRoadNearContainerController = nearPointOne(containerControllerPos, roadList);
        let spawn0ToController = roadPath(roadListAdj, posRoadNearSpawn0, posRoadNearContainerController);
        //Spawn0 to mineral
        const containerMineralReference = Memory['colony'][this.mainRoom]['roomPlanning']['containerReference']['container_mineral'];
        const containerMineralPos = Memory['colony'][this.mainRoom]['roomPlanning']['model']['container'][containerMineralReference]['pos'];
        const posRoadNearContainerMineral = nearPointOne(containerMineralPos, roadList);
        let spawn0ToMineral = roadPath(roadListAdj, posRoadNearSpawn0, posRoadNearContainerMineral);
        Memory['colony'][this.mainRoom]['roomPlanning']['roadReference'] = {
            'spawn0ToSource1': spawn0ToSource1,
            'spawn0ToSource2': spawn0ToSource2,
            'spawn0ToController': spawn0ToController,
            'spawn0ToMineral': spawn0ToMineral
        };
    }
    linkReference(linkList) {
        const containerReference = Memory['colony'][this.mainRoom]['roomPlanning']['containerReference'];
        let posSourceContainer1 = getPlanningStructurePos(this.mainRoom, 'container', containerReference['container_source1']);
        let posSourceContainer2 = getPlanningStructurePos(this.mainRoom, 'container', containerReference['container_source2']);
        let posControllerContainer = getPlanningStructurePos(this.mainRoom, 'container', containerReference['container_controller']);
        getPlanningStructurePos(this.mainRoom, 'container', containerReference['container_mineral']);
        let linkSourcel = minDistance(posSourceContainer1, linkList);
        let linkSource2 = minDistance(posSourceContainer2, linkList);
        let linkController = minDistance(posControllerContainer, linkList);
        let linkCenter;
        for (let i = 0; i < linkList.length; ++i) {
            if (i != linkSourcel && i != linkSource2 && i != linkController) {
                linkCenter = i;
            }
        }
        Memory['colony'][this.mainRoom]['roomPlanning']['linkReference'] = {
            'link_source1': linkSourcel,
            'link_source2': linkSource2,
            'link_controller': linkController,
            'link_center': linkCenter
        };
    }
    containerReference(containerList) {
        let posSource1 = Memory['colony'][this.mainRoom]['roomPlanning']['model']['source'][0]['pos'];
        let posSource2 = Memory['colony'][this.mainRoom]['roomPlanning']['model']['source'][1]['pos'];
        let posMineral = Memory['colony'][this.mainRoom]['roomPlanning']['model']['source'][2]['pos'];
        let aux = Game.rooms[this.mainRoom].controller;
        let posController = [aux.pos.x, aux.pos.y];
        let containerSourcel = minDistance(posSource1, containerList);
        let containerSource2 = minDistance(posSource2, containerList);
        let containerMineral = minDistance(posMineral, containerList);
        let containerController = minDistance(posController, containerList);
        Memory['colony'][this.mainRoom]['roomPlanning']['containerReference'] = {
            'container_source1': containerSourcel,
            'container_source2': containerSource2,
            'container_mineral': containerMineral,
            'container_controller': containerController
        };
    }
    /*
        Planning model data.
    */
    generateModel(model) {
        Memory['colony'][this.mainRoom]['roomPlanning']['model'] = {};
        for (let structureName in model) {
            Memory['colony'][this.mainRoom]['roomPlanning']['model'][structureName] = [];
            for (let i in model[structureName])
                Memory['colony'][this.mainRoom]['roomPlanning']['model'][structureName].push({ 'id': '', 'pos': model[structureName][i] });
        }
        const saPos = [Game.flags.pa.pos.x, Game.flags.pa.pos.y];
        const sbPos = [Game.flags.pb.pos.x, Game.flags.pb.pos.y];
        const mPos = [Game.flags.pm.pos.x, Game.flags.pm.pos.y];
        Memory['colony'][this.mainRoom]['roomPlanning']['model']['source'] = [];
        Memory['colony'][this.mainRoom]['roomPlanning']['model']['source'].push({ 'id': getId(this.mainRoom, saPos, 'source'), 'pos': saPos });
        Memory['colony'][this.mainRoom]['roomPlanning']['model']['source'].push({ 'id': getId(this.mainRoom, sbPos, 'source'), 'pos': sbPos });
        Memory['colony'][this.mainRoom]['roomPlanning']['model']['source'].push({ 'id': getId(this.mainRoom, mPos, 'mineral'), 'pos': mPos });
    }
    savePlanningForEveryRCL(roadList) {
        Memory['colony'][this.mainRoom]['roomPlanning'];
        this.stage1(roadList);
    }
    stage1(roadList) {
        const memRoomPlanning = Memory['colony'][this.mainRoom]['roomPlanning'];
        //get the first spawn location from the model
        memRoomPlanning['stage'] = {};
        memRoomPlanning['stage']['spawn'] = [];
        memRoomPlanning['stage']['spawn'].push(memRoomPlanning['model']['spawn'][0]);
        //add container
        let containerList = memRoomPlanning['model']['container'];
        let posSource1 = memRoomPlanning['model']['source'][0];
        let posSource2 = memRoomPlanning['model']['source'][1];
        let posController = memRoomPlanning['model']['source'][2];
        let containerSourcel = minDistance(posSource1, containerList);
        let containerSource2 = minDistance(posSource2, containerList);
        let containerController = minDistance(posController, containerList);
        memRoomPlanning['stage']['container'] = [];
        memRoomPlanning['stage']['container'].push(containerSourcel);
        memRoomPlanning['stage']['container'].push(containerSource2);
        memRoomPlanning['stage']['container'].push(containerController);
    }
}

/*
Memory.colony.
        mainRoom.
            state{}
            roomPlanning{}
            dpt_work{}
*/
/*
    Colony's memory block inizializer.
    Only when create a new colony
*/
class Mem {
    constructor(roomName) {
        this.mainRoom = roomName;
        //this.build();
    }
    initializeWorkerCreepsMem() {
        //initialize dpt_workers creeps
        const colonyMem = Memory['colony'][this.mainRoom];
        const namePrefix = this.mainRoom;
        colonyMem['dpt_work']['creep'][namePrefix + '_dptWork_1'] = {};
        colonyMem['dpt_work']['creep'][namePrefix + '_dptWork_1']['active'] = false;
        colonyMem['dpt_work']['creep'][namePrefix + '_dptWork_1']['setting'] = {};
        colonyMem['dpt_work']['creep'][namePrefix + '_dptWork_2'] = {};
        colonyMem['dpt_work']['creep'][namePrefix + '_dptWork_2']['active'] = false;
        colonyMem['dpt_work']['creep'][namePrefix + '_dptWork_2']['setting'] = {};
    }
    initializeDptWork() {
        const colonyMem = Memory['colony'][this.mainRoom];
        colonyMem['dpt_work'] = {};
        colonyMem['dpt_work']['creep'] = {};
        colonyMem['dpt_work']['buildTask'] = [];
        colonyMem['dpt_work']['repairTask'] = [];
        colonyMem['dpt_work']['ticksToSpawn'] = {};
        this.initializeWorkerCreepsMem();
    }
    /*
        request mem for a new colony
    */
    initializeColonyMem() {
        if (!Memory['colony']) {
            Memory['colony'] = {};
        }
        delete Memory['colony'][this.mainRoom];
        Memory['colony'][this.mainRoom] = {};
        const colonyMem = Memory['colony'][this.mainRoom];
        colonyMem['state'] = {};
        colonyMem['state']['currentRCL'] = 1;
        colonyMem['state']['updateRoomPlanning'] = true;
        colonyMem['state']['updateCreepNum'] = true;
        colonyMem['state']['updateCreepNumWorker'] = true;
        colonyMem['state']['updateCreepNum'] = 1;
        //save roomPlaning Block
        let planning = new TranslatePlanning(this.mainRoom);
        planning.savePlanningModel();
        colonyMem['creepSpawning'] = {};
        colonyMem['creepSpawning']['spawn'] = [];
        colonyMem['creepSpawning']['task'] = {};
        colonyMem['creepSpawning']['completeTask'] = {};
        this.initializeDptHarvest();
        this.initializeDptLogistic();
        this.initializeDptWork();
    }
    initializeDptLogistic() {
        const colonyMem = Memory['colony'][this.mainRoom];
        colonyMem['dpt_logistic'] = {};
        colonyMem['dpt_logistic']['state'] = '';
        colonyMem['dpt_logistic']['request'] = [];
        colonyMem['dpt_logistic']['sourceTask'] = {};
        colonyMem['dpt_logistic']['targetTask'] = {};
        colonyMem['dpt_logistic']['creep'] = {};
        colonyMem['dpt_logistic']['ticksToSpawn'] = {};
    }
    initializeDptHarvest() {
        const colonyMem = Memory['colony'][this.mainRoom];
        colonyMem['dpt_harvest'] = {};
        //harvesters collect energy request 
        colonyMem['dpt_harvest']['request'] = [];
        colonyMem['dpt_harvest']['creep'] = {};
        //'id': [Pos1, Pos2, Pos3...]
        colonyMem['dpt_harvest']['ticksToSpawn'] = {};
    }
}

const energyAvailable$1 = [300, 550, 800, 1300, 1800, 2300, 5600, 10000];
function getEnergyRCL$1(energyAmount) {
    let i = 0;
    while (i < 8) {
        if (energyAmount <= energyAvailable$1[i])
            return i + 1;
        ++i;
    }
    return -1;
}
function getBody(role, rcl) {
    let prototype = bodyPrototype[role];
    const componentNum = bodyComponentNum[role][rcl];
    let act = [];
    for (let i in prototype) {
        for (let j = 0; j < componentNum[i]; ++j) {
            act.push(prototype[i]);
        }
    }
    return act;
}
function ticksToSpawn(role, rcl) {
    const componentNum = bodyComponentNum[role][rcl.toString()];
    const ticks = componentNum.reduce((x, y) => x + y, 0);
    return ticks * 3;
}
const bodyPrototype = {
    harvester: [WORK, CARRY, MOVE],
    worker: [WORK, CARRY, MOVE],
    transporter: [CARRY, MOVE]
};
const bodyComponentNum = {
    //WORK  CARRY   MOVE
    harvester: {
        1: [2, 1, 1],
        2: [4, 1, 2]
    },
    worker: {
        1: [1, 1, 1],
        2: [2, 2, 2]
    },
    transporter: {
        1: [2, 2],
        2: [3, 2]
    }
};

class CreepSpawning {
    constructor(mainRoom) {
        this.mainRoom = mainRoom;
        this.memory = Memory['colony'][mainRoom]['creepSpawning'];
    }
    /*
        colonyMem['Spawning'] = {};
        colonyMem['Spawning']['spawn'] = [];
        colonyMem['Spawning']['task'] = [];
        colonyMem['Spawning']['completeTask'] = {};
    */
    notifyTaskComplete(name, role, dpt) {
        this.memory['completeTask'];
        const energyRCL = getEnergyRCL$1(Game.rooms[this.mainRoom].energyCapacityAvailable);
        /*
        const completeTask: SpawnTaskComplete = {
            creepName: name,
            deadTime: setting.ticksToSpawn(role, energyRCL) + 1500 + 10
        };
        */
        //console.log(dpt);
        //console.log(name);
        //console.log(setting.ticksToSpawn(role, energyRCL));
        Memory['colony'][this.mainRoom][dpt]['ticksToSpawn'][name] = Game.time + ticksToSpawn(role, energyRCL) + 1500 + 10;
    }
    uid() {
        //return (performance.now().toString(36)+Math.random().toString(36)).replace(/\./g,"");
        return (Math.random().toString(36).substr(2, 9));
    }
    spawn(spawnName, creepName, creepRole, creepData, dpt) {
        const spawn = Game.spawns[spawnName];
        const energyRCL = getEnergyRCL$1(Game.rooms[this.mainRoom].energyCapacityAvailable);
        //console.log(energyRCL);
        const creepBody = getBody(creepRole, energyRCL);
        return spawn.spawnCreep(creepBody, creepName, {
            memory: {
                role: creepRole,
                department: dpt,
                roomName: this.mainRoom,
                data: creepData
            }
        });
    }
    spawnTaskExecution() {
        const spawnTask = this.memory['task'];
        let spawnIndex = 0;
        for (let creepName in spawnTask) {
            //console.log(creepName);
            const spawnList = this.memory['spawn'];
            if (spawnIndex < spawnList.length) {
                const spawnName = spawnList[spawnIndex];
                const creepRole = spawnTask[creepName]['role'];
                const creepDpt = spawnTask[creepName]['department'];
                const creepData = spawnTask[creepName]['data'];
                if (this.spawn(spawnName, creepName, creepRole, creepData, creepDpt) == OK) {
                    delete spawnTask[creepName];
                    this.notifyTaskComplete(creepName, creepRole, creepDpt);
                }
                ++spawnIndex;
            }
        }
    }
    getAvailableSpawnName() {
        const spawnList = this.memory['spawn'];
        for (let i = 0; i < spawnList.length; ++i) {
            if (Game.spawns[spawnList[i]].spawning == null)
                return spawnList[i];
        }
        return null;
    }
    /**Creep Queen must be spawned or spawing */
    renewQueen() {
        const queen = Game.creeps['Queen' + this.mainRoom];
        if (queen) {
            if (queen.spawning)
                return false;
            else if (queen.ticksToLive < 200)
                return true;
        }
    }
    spawnQueen() {
        const spawnName = this.getAvailableSpawnName();
        if (spawnName) {
            //console.log(spawnName);
            const source = {
                id: null,
                roomName: null,
                pos: null
            };
            const data = {
                source: source,
                target: null
            };
            this.spawn(spawnName, 'Queen' + this.mainRoom, 'transporter', data, 'dpt_logistic');
        }
    }
    run() {
        const queen = Game.creeps['Queen' + this.mainRoom];
        if (!queen) {
            this.spawnQueen();
        }
        else if (queen.ticksToLive < 200) {
            this.renewQueen();
        }
        this.spawnTaskExecution();
    }
}

class Department {
    constructor(mainRoom, type) {
        this.mainRoom = mainRoom;
        this.type = type;
        this.memory = Memory['colony'][mainRoom][type];
        this.spawnTaskMemory = Memory['colony'][mainRoom]['creepSpawning'];
    }
    sendSpawnTask(creepName, roleType) {
        this.memory['creep'];
        Memory['colony'][this.mainRoom]['creepSpawning']['task'][creepName] = { 'role': roleType, 'dpt': 'dpt_work' };
        //Memory['colony'][this.mainRoom]['creepSpawning']['task'].push(spawnTask);
    }
    deleteCreep(creepName) {
    }
    sendToSpawnInitializacion(creepName, role, data, dpt) {
        Memory['colony'][this.mainRoom]['creepSpawning']['task'][creepName] = {};
        const spawnTask = Memory['colony'][this.mainRoom]['creepSpawning']['task'][creepName];
        //console.log(creepName);
        spawnTask['role'] = role;
        spawnTask['roomName'] = this.mainRoom;
        spawnTask['department'] = dpt;
        spawnTask['data'] = data;
    }
    uid() {
        //return (performance.now().toString(36)+Math.random().toString(36)).replace(/\./g,"");
        return (Math.random().toString(36).substr(2, 9));
    }
}

//Creep Controller
const energyAvailable = [300, 550, 800, 1300, 1800, 2300, 5600, 10000];
function getEnergyRCL(energyAmount) {
    let i = 0;
    while (i < 8) {
        if (energyAmount <= energyAvailable[i])
            return i + 1;
        ++i;
    }
    return -1;
}
//Restriccion: pos no puede estar en el borde del mapa!!!
function positionToHarvest(roomName, pos) {
    const terrain = new Room.Terrain(roomName);
    let canStand = [];
    if (terrain.get(pos[0] - 1, pos[1] + 1) != 1)
        canStand.push([pos[0] - 1, pos[1] + 1]); //x-1, y+1
    if (terrain.get(pos[0] - 1, pos[1]) != 1)
        canStand.push([pos[0] - 1, pos[1]]); //x-1, y
    if (terrain.get(pos[0] - 1, pos[1] - 1) != 1)
        canStand.push([pos[0] - 1, pos[1] - 1]); //x-1, y-1
    if (terrain.get(pos[0], pos[1] + 1) != 1)
        canStand.push([pos[0], pos[1] + 1]); //x, y+1
    if (terrain.get(pos[0], pos[1]) != 1)
        canStand.push([pos[0], pos[1]]); //x, y
    if (terrain.get(pos[0], pos[1] - 1) != 1)
        canStand.push([pos[0] - 1, pos[1] + 1]); //x, y-1
    if (terrain.get(pos[0] + 1, pos[1] + 1) != 1)
        canStand.push([pos[0] + 1, pos[1] + 1]); //x+1, y+1
    if (terrain.get(pos[0] + 1, pos[1]) != 1)
        canStand.push([pos[0] + 1, pos[1]]); //x-1, y
    if (terrain.get(pos[0] + 1, pos[1] - 1) != 1)
        canStand.push([pos[0] + 1, pos[1] - 1]); //x-1, y-1
    return canStand;
}

function taskName(request) {
    //return (performance.now().toString(36)+Math.random().toString(36)).replace(/\./g,"");
    return (request.type + Math.random().toString(36).substr(2, 9));
}

/******************* FASE1: OBJECT SEND REQUEST  ***********************/
/* Fase1.1:  TASK REQUEST CREATION */
function moveRequest(id, pos, roomName) {
    const r = {
        type: 'MOVE',
        source: {
            id: id,
            pos: pos,
            roomName: roomName
        }
    };
    return r;
}
/************** Fase1.2. OBJECT: SEND TASK REQUEST ****************/
function sendRequest(roomName, dpt, creepName) {
    Memory['colony'][roomName][dpt]['request'].push(creepName);
}
/* Fase2.2:  SEND LOGISTIC TASK */
function sendLogisticTask(roomName, taskName, request) {
    if (request.type == 'MOVE' || request.type == 'WITHDRAW') {
        Memory['colony'][roomName]['dpt_logistic']['sourceTask'][taskName] = request;
    }
    else {
        Memory['colony'][roomName]['dpt_logistic']['targetTask'][taskName] = request;
    }
}

class Dpt_Work extends Department {
    constructor(dptRoom) {
        super(dptRoom, 'dpt_harvest');
    }
    getSourceId1() {
        return Memory['colony'][this.mainRoom]['roomPlanning']['model']['source'][0];
    }
    getSourceId2() {
        return Memory['colony'][this.mainRoom]['roomPlanning']['model']['source'][1];
    }
    actualizeCreepNumber() {
        const rclEnergy = getEnergyRCL(Game.rooms[this.mainRoom].energyCapacityAvailable);
        if (rclEnergy == 1) {
            const sourceId1 = this.getSourceId1();
            const sourceId2 = this.getSourceId2();
            let numCreepsNeeded1 = positionToHarvest(this.mainRoom, sourceId1['pos']).length;
            if (numCreepsNeeded1 > 3)
                numCreepsNeeded1 = 3;
            const data1 = {
                source: sourceId1.id,
                target: null
            };
            const role = 'harvester';
            for (let i = 0; i < numCreepsNeeded1; ++i) {
                const creepName = this.uid();
                this.sendToSpawnInitializacion(creepName, role, data1, 'dpt_harvest');
            }
            let numCreepsNeeded2 = positionToHarvest(this.mainRoom, sourceId2['pos']).length;
            if (numCreepsNeeded2 > 3)
                numCreepsNeeded2 = 3;
            const data2 = {
                source: sourceId2.id,
                target: null
            };
            for (let i = 0; i < numCreepsNeeded2; ++i) {
                const creepName = this.uid();
                this.sendToSpawnInitializacion(creepName, role, data2, 'dpt_harvest');
            }
        }
        //let dif = numCreepsNeeded - activeCreeps;
        //setting.workerSourceConfigUpdate(rclEnergy, this.mainRoom);
    }
    processRequest() {
        const requestList = this.memory['request'];
        for (let i = 0; i < requestList.length; ++i) {
            const creepName = requestList[0];
            const creep = Game.creeps[creepName];
            const logisticTaskRequest = moveRequest(creep.id, [creep.pos.x, creep.pos.y], creep.memory['roomName']);
            sendLogisticTask(creep.memory['roomName'], taskName(logisticTaskRequest), logisticTaskRequest);
        }
        //clear request
        this.memory['request'] = [];
    }
    run() {
        /*
        if (Memory['colony'][this.mainRoom]['state']['updateCreepNum']) {
            this.actualizeCreepNumber();
            Memory['colony'][this.mainRoom]['state']['updateCreepNum']= false;
        }
        */
        this.processRequest();
    }
}

/**
    Ocupa de ejecutar todas las acciones de una colonia
    y la comunicacion intercolonial
*/
class Colony {
    /* Colony property */
    //dpt_work: Dpt_Work;
    //creepSpawning: CreepSpawning;
    constructor(mainRoom) {
        this.mainRoom = mainRoom;
        //this.memory = new Mem(mainRoom);
        //this.dpt_work = new Dpt_Work(mainRoom);
        //this.creepSpawning = new CreepSpawning(mainRoom);
    }
    //initialize colony Memory
    initializeMem() {
        const memory = new Mem(this.mainRoom);
        memory.initializeColonyMem();
    }
    run() {
        //const dpt_work = new Dpt_Work(this.mainRoom);
        //const creepSpawning = new CreepSpawning(this.mainRoom);
        //dpt_work.run();
        //creepSpawning.run();
        const dpt_harvest = new Dpt_Work(this.mainRoom);
        dpt_harvest.run();
        const creepSpawning = new CreepSpawning(this.mainRoom);
        creepSpawning.run();
    }
}
//Memory['colony']['W7N7']['creepSpawning']['spawn'].push('Spawn1')
//ColonyApi.createColony('W7N7')
//Memory['colony']['W7N7']['dpt_work']['ticksToSpawn']['W7N7_dptWork_1'] = Game.time + 10;

global.ColonyApi = {
    createColony(roomName) {
        const col1 = new Colony(roomName);
        col1.initializeMem();
        //col1.updateSpawnTask();
        return "Colony " + roomName + " created.";
        /*
        let request: LogisticTaskRequest = {
            type: 'MOVE',
            data: {
                id: 'sss',
                pos: [1,2],
                roomName: 'dddd'
            }
        }
        */
    },
    sendTaskRequest(roomName, dpt, request) {
        Memory['colony'][roomName][dpt]['request'].push(request);
    }
};

/**
 * 把 obj2 的原型合并到 obj1 的原型上
 * 如果原型的键以 Getter 结尾，则将会把其挂载为 getter 属性
 * @param obj1 要挂载到的对象
 * @param obj2 要进行挂载的对象
 */
const assignPrototype = function (obj1, obj2) {
    Object.getOwnPropertyNames(obj2.prototype).forEach(key => {
        if (key.includes('Getter')) {
            Object.defineProperty(obj1.prototype, key.split('Getter')[0], {
                get: obj2.prototype[key],
                enumerable: false,
                configurable: true
            });
        }
        else
            obj1.prototype[key] = obj2.prototype[key];
    });
};

const roles$1 = {
    colonizer: (data) => ({
        source: creep => {
            const source = Game.getObjectById(data.source);
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
            return creep.store.getFreeCapacity() <= 0;
        },
        target: creep => {
            creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
            const controller = Game.rooms[creep.room.name].controller;
            if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE)
                creep.moveTo(controller);
            /*
            if (cSide) {
                if (creep.build(cSide) == ERR_NOT_IN_RANGE) creep.moveTo(cSide);
            }
            */
            return (creep.store.getUsedCapacity() <= 0);
        }
    }),
    builder: (data) => ({
        source: creep => {
            const source = Game.getObjectById(data.source);
            if (creep.harvest(source) == ERR_NOT_IN_RANGE)
                creep.moveTo(source);
            // 自己身上的能量装满了，返回 true（切换至 target 阶段）
            return creep.store.getFreeCapacity() <= 0;
        },
        target: creep => {
            const target = Game.getObjectById(data.target);
            if (creep.build(target) == ERR_NOT_IN_RANGE)
                creep.moveTo(target);
            return creep.store[RESOURCE_ENERGY] <= 0;
        }
    }),
    harvester: (data) => ({
        source: creep => {
            const source = Game.getObjectById(data.source);
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
            //change state if creep store max
            return creep.store.getFreeCapacity() <= 0;
        },
        target: creep => {
            let target;
            target = Game.getObjectById(data.target);
            //if target is a creep, throw a task to call a transporter
            if (!target) {
                if (!creep.memory['waiting']) {
                    //publisher.callSourceTransporter(creep);
                    sendRequest(creep.memory['roomName'], creep.memory['department'], creep.name);
                    creep.memory['waiting'] = true;
                }
            }
            /*
            else if (target instanceof Creep) {
                creep.transfer(target, RESOURCE_ENERGY)
            }
            */
            else {
                creep.transfer(target, RESOURCE_ENERGY);
            }
            return (creep.store.getUsedCapacity() <= 0);
        }
    }),
    /*
    transporter: (data: LogisticData): ICreepConfig => ({
        source: creep => {
            const sourceID = creep.memory['data']['source']['id'];
            const source = Game.getObjectById(sourceID);
            if (source instanceof Creep) {
                creep.moveTo(source);
            }
    

            return false;
        },
        target: creep => {
            return false;
        }

    }),
    */
};

const roles = {
    manager: (data) => ({
        source: creep => {
            return true;
        },
        target: creep => {
            return false;
        }
    }),
    transporter: (data) => ({
        source: creep => {
            /*
            const sourceData = creep.memory['task']['source'];
            let move = 'MOVE';
            if (sourceData) return transferTaskOperations[move].source(creep)
            else {
                creep.say('💤')
                return true;
            }
            */
            creep.say('zz');
            return false;
        },
        target: creep => {
            if (creep.memory['task'] = null) {
                sendRequest(creep.memory['roomName'], creep.memory['department'], creep.name);
                creep.memory['sleeping'] = true;
                return true;
            }
            else {
                //WORKING CODE
                const taskType = creep.memory['task']['type'];
                return transferTaskOperations[taskType].source(creep);
            }
        }
    })
};
const transferTaskOperations = {
    MOVE: {
        source: (creep) => {
            creep.say('💤');
            return false;
            /*
            const sourceData = creep.memory['task']['source'];
            const targetPos:RoomPosition = new RoomPosition(sourceData['pos'][0], sourceData['pos'][1], sourceData['roomName'])
            creep.moveTo(targetPos)
            if (creep.pos.isNearTo(targetPos)) {
                return true;
            }
            return false;
            */
        },
        target: (creep) => {
            const targetData = creep.memory['task']['target'];
            Game.getObjectById(targetData['id']);
            return false;
        }
    },
    TRANSFER: {
        source: (creep) => {
            return false;
        },
        target: (creep) => {
            return false;
        }
    },
    WITHDRAW: {
        source: (creep) => {
            return false;
        },
        target: (creep) => {
            return false;
        }
    }
};

//import remoteRoles from './remote'
//import warRoles from './war'
const creepWork = Object.assign(Object.assign({}, roles$1), roles);

/*
    creep work
*/
class CreepExtension extends Creep {
    //public work(data: SourceTargetData, role: string): void
    work() {
        //---------------- GET CREEP LOGIC --------------------
        //console.log(this.memory['role']);
        //console.log(this.memory['data'])
        const creepLogic = creepWork[this.memory['role']](this.memory['data']);
        //const creepLogic = roles[role](data);
        // ------------------------ 第二步：执行 creep 准备阶段 ------------------------
        // 没准备的时候就执行准备阶段
        if (!this.memory['ready']) {
            // 有准备阶段配置则执行
            if (creepLogic.prepare && creepLogic.isReady) {
                creepLogic.prepare(this);
                this.memory['ready'] = creepLogic.isReady(this);
            }
            // 没有就直接准备完成
            else
                this.memory['ready'] = true;
            return;
        }
        // ------------------------ 第三步：执行 creep 工作阶段 ------------------------
        let stateChange = true;
        // 执行对应阶段
        // 阶段执行结果返回 true 就说明需要更换 working 状态
        if (this.memory['working']) {
            if (creepLogic.target)
                stateChange = creepLogic.target(this);
        }
        else {
            if (creepLogic.source)
                stateChange = creepLogic.source(this);
        }
        // 状态变化了就切换工作阶段
        if (stateChange)
            this.memory['working'] = !this.memory['working'];
    }
}

/**
 * 挂载 creep 拓展
 */
var mountCreep = () => {
    // 保存原始 move，在 creepExtension 里会进行修改
    assignPrototype(Creep, CreepExtension);
};

//Main loop
module.exports.loop = function () {
    mountCreep();
    const colony = new Colony('W7N7');
    colony.run();
    //const creepSpawning = new CreepSpawning('W8N7');
    //console.log(creepSpawning.uid());
    //console.log(performance.now());
    //console.log('C' + Math.random().toString(36).substr(2,8));
    const creep = Memory['creeps'];
    for (let creepName in creep) {
        if (Game.creeps[creepName]) {
            Game.creeps[creepName]['work']();
        }
    }
};
//# sourceMappingURL=main.js.map
