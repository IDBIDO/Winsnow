import {Colony} from "./colony/Colony"
import * as ColonyApi from "./colony/ColonyApi"
import {Mem} from "./colony/Memory"

import MemHack from './MemHack'

import mountCreep from './creep/mount'
import { CreepSpawning } from "./structure/CreepSpawning"

//Main loop
module.exports.loop = function() {

  MemHack.pretick();

  mountCreep();
  Mem;
  

  ColonyApi;

  const colony = new Colony('W2N5');
  colony.run();

  //const creepSpawning = new CreepSpawning('W8N7');
  //console.log(creepSpawning.uid());
    //console.log(performance.now());
    //console.log('C' + Math.random().toString(36).substr(2,8));
  
    const creep = Memory['creeps'];
    for (let creepName in creep)  {
      if (Game.creeps[creepName]) {
        Game.creeps[creepName]['work']();
        
      }
    }
    
    

}
