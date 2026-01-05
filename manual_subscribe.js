const ethers = require('ethers');
require('dotenv').config();

const SENTINEL_ADDRESS = "0xbC92DAD9027f3bcEC366EaBdC581d484590Ed337";
const POOL_A = "0x46eE74Bf6D3c6b06483Ec4BF4066a8117Fa8Cb47";
const POOL_B = "0xBE2bcf983b84c030b0C851989aDF351816fA21D2";

const LASNA_RPC = "https://lasna-rpc.rnk.dev/";

const ABI = [
    "function addPool(address _pool) external payable"
];

async function manualSubscribe() {
    const provider = new ethers.JsonRpcProvider(LASNA_RPC);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const sentinel = new ethers.Contract(SENTINEL_ADDRESS, ABI, wallet);

    console.log(`🔌 Manually subscribing pools on Sentinel: ${SENTINEL_ADDRESS}`);

    // Subscribe Pool A
    try {
        console.log(`Subscribing Pool A (${POOL_A})...`);
        const txA = await sentinel.addPool(POOL_A, { value: ethers.parseEther("0.1"), gasLimit: 500000 });
        console.log(`Pool A Tx: ${txA.hash}`);
        await txA.wait();
        console.log("✅ Pool A Subscribed");
    } catch (e) {
        console.error("❌ Pool A Subscription Failed:", e.message);
    }

    // Subscribe Pool B
    try {
        console.log(`Subscribing Pool B (${POOL_B})...`);
        const txB = await sentinel.addPool(POOL_B, { value: ethers.parseEther("0.1"), gasLimit: 500000 });
        console.log(`Pool B Tx: ${txB.hash}`);
        await txB.wait();
        console.log("✅ Pool B Subscribed");
    } catch (e) {
        console.error("❌ Pool B Subscription Failed:", e.message);
    }
}

manualSubscribe();
