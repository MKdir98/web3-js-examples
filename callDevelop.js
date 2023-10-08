var fs = require('fs')
const { Web3 } = require('web3');
const LegacyTransaction = require('@ethereumjs/tx').LegacyTransaction;
var web3 = new Web3(new Web3.providers.HttpProvider("https://bsc-dataseed.binance.org/"))
web3.handleRevert = true;
const Common = require('@ethereumjs/common').Common;


function getAmountOut(amountIn, reserveIn, reserveOut) {
    amountInWithFee = amountIn * 9975n;
    numerator = amountInWithFee * reserveOut;
    denominator = reserveIn * 10000n + amountInWithFee;
    return numerator / denominator;
}

async function sendWeth() {
    // var biswapRouter = new web3.eth.Contract(JSON.parse(fs.readFileSync('router-abi.json', 'utf-8')), "0x3a6d8ca21d1cf76f653a67577fa0d27453350dd8");
    var pancakeRouter = new web3.eth.Contract(JSON.parse(fs.readFileSync('router-abi.json', 'utf-8')), "0x10ed43c718714eb63d5aa57b78b54704e256024e");
    // var biswapPair = new web3.eth.Contract(JSON.parse(fs.readFileSync('Pair.json', 'utf-8')), "0x8860922eb2795ab0d57363653dd7ebf18d7c0a42");
    var pancakePair = new web3.eth.Contract(JSON.parse(fs.readFileSync('Pair.json', 'utf-8')), "0x16b9a82891338f9ba80e2d6970fdda79d1eb0dae");
    // data1 = await biswapPair.methods.getReserves().call();
    data2 = await pancakePair.methods.getReserves().call(null, 32084134);

    // console.log(await biswapRouter.methods.getAmountOut(562 * 10 ^ 18, data1[0], data2[0]).call(null, 32084134));
    console.log(data2);
    console.log(await pancakeRouter.methods.getAmountOut(378.6299 * 10 ^ 18, data2[1], data2[0]).call(null, 32084134));
}

// sendWeth();
console.log(getAmountOut(53000000000000000n, 49594247777043545722875n, 10480193138176772021374380n))
// 53000000000000000
// 49594247777043545722875
// 10480193138176772021374380
// 11171880710722742112


// require(amountIn > 0, 'PancakeLibrary: INSUFFICIENT_INPUT_AMOUNT');
// require(reserveIn > 0 && reserveOut > 0, 'PancakeLibrary: INSUFFICIENT_LIQUIDITY');
// uint amountInWithFee = amountIn.mul(9975);
// uint numerator = amountInWithFee.mul(reserveOut);
// uint denominator = reserveIn.mul(10000).add(amountInWithFee);
// amountOut = numerator / denominator;

