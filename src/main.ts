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


  const colony = new Colony('W1N7');
  //colony.run();

    const creep = Memory['creeps'];
    for (let creepName in creep)  {
      if (Game.creeps[creepName]) {
        //.creeps[creepName]['work']();
        

      }
    }
    
//Memory['colony']['W1N7']['creepSpawning']['spawn'].push('Spawn1')
//ColonyApi.createColony('W1N7')
//ColonyApi.destroyAllBuilding('W1N7')
//ColonyApi.deleteColony('W1N7')
//Memory.creeps = {}
}
