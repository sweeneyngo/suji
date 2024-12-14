// Represent an 81-bit bitmask using a Uint8Array (with 12 bytes for 81 bits)
function createBitmask(): Uint8Array {
    return new Uint8Array(12);
}

// Function to set a bit at a specific index (0 to 80)
function setBit(bitmask: Uint8Array, index: number): void {
    const byteIndex = Math.floor(index / 8);   // Which byte
    const bitIndex = index % 8;                 // Which bit in that byte
    bitmask[byteIndex] |= (1 << bitIndex);    // Set the bit
}

// Function to clear a bit at a specific index (0 to 80)
function clearBit(bitmask: Uint8Array, index: number): void {
    const byteIndex = Math.floor(index / 8);   // Which byte
    const bitIndex = index % 8;                 // Which bit in that byte
    bitmask[byteIndex] &= ~(1 << bitIndex);  // Clear the bit
}

// Function to check if a bit is set at a specific index (0 to 80)
function isBitSet(bitmask: Uint8Array, index: number): boolean {
    const byteIndex = Math.floor(index / 8);   // Which byte
    const bitIndex = index % 8;                 // Which bit in that byte
    return (bitmask[byteIndex] & (1 << bitIndex)) !== 0;
}

export { createBitmask, setBit, clearBit, isBitSet };
