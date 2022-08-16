import {Colony} from "./colony/Colony"
import * as ColonyApi from "./colony/ColonyApi"
import {Mem} from "./colony/Memory"

import MemHack from './MemHack'

import mountCreep from './creep/mount'
import { CreepSpawning } from "./structure/CreepSpawning"
import * as SuperMove from "./SuperMove"

//Main loop
module.exports.loop = function() {

  MemHack.pretick();
  SuperMove;
  mountCreep();
  Mem;
  

  ColonyApi;

  const colony = new Colony('W7N9');
  colony.run();

    const creep = Memory['creeps'];
    for (let creepName in creep)  {
      if (Game.creeps[creepName]) {
        Game.creeps[creepName]['work']();
        

      }
    }
    
//Memory['colony']['W7N9']['creepSpawning']['spawn'].push('Spawn1')
//ColonyApi.createColony('W7N9')
//ColonyApi.deleteColony('W7N9')
//Memory.creeps = {}
}
