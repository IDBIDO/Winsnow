import { assignPrototype } from "@/utils"
import CreepExtension from "@/creep/mount/mout.creep"

/**
 * 挂载 creep 拓展
 */

export default () => {
    // 保存原始 move，在 creepExtension 里会进行修改
    assignPrototype(Creep, CreepExtension)
}