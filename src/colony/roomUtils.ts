export const energyAvailable = [300, 550, 800, 1300, 1800, 2300, 5600, 10000]

export function getEnergyRCL(energyAmount: number): number {

    let found = false;
    let i = 0;
    while( !found && i < 8) {
        if (energyAmount <= energyAvailable[i]) return i+1;
        ++i;
    }
    return -1;
}