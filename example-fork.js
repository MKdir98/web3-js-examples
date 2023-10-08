const networkUrl = 'http://127.0.0.1:8545';
const chainId = 1;
const privateKeyString = "ea1281205cdc498217053a073f58d5eb31d0a3e382b6316db4eccda3b96d2964";
const address = "0x538d179C5e9f8C91400C0D582Ac17ed638E2B73A";
const routerAddress = "0x10ed43c718714eb63d5aa57b78b54704e256024e";
const wethAddress = "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c";
const tokenAddress = "0x55d398326f99059ff775485246999027b3197955";
const amount = 5000000000000000;
// const destinationAddress = args[8];

var fs = require('fs')
const { Web3 } = require('web3');
const LegacyTransaction = require('@ethereumjs/tx').LegacyTransaction;
var web3 = new Web3(new Web3.providers.HttpProvider(networkUrl))
web3.handleRevert = true;
const Common = require('@ethereumjs/common').Common;

async function sendKaramTransactions(from, sendFunction, to, value) {
    var count = await web3.eth.getTransactionCount(from);
    var gasPrice = await web3.eth.getGasPrice();
    var rawTransaction = {
        "from": from,
        "to": to,
        "data": sendFunction.encodeABI(),
        "nonce": web3.utils.toHex(count),
        "gasPrice": web3.utils.toHex(gasPrice)
    };
    if (value) {
        rawTransaction['value'] = web3.utils.toHex(value);
    }
    var gasLimit = await web3.eth.estimateGas(rawTransaction);
    rawTransaction['gasLimit'] = web3.utils.toHex(gasLimit);
    const common = Common.custom({
        chainId: chainId
    });
    var transaction = LegacyTransaction.fromTxData(rawTransaction, { common });
    var privateKey = Buffer.from(privateKeyString, 'hex');
    var signedTx = transaction.sign(privateKey);
    var result = await web3.eth.sendSignedTransaction('0x' + Buffer.from(signedTx.serialize()).toString('hex'));
    console.log(result);
}

async function example() {
    var contract = new web3.eth.Contract(JSON.parse(fs.readFileSync('abi.json', 'utf-8')).abi, routerAddress);
    var wethContract = new web3.eth.Contract(JSON.parse(fs.readFileSync('weth.json', 'utf-8')).abi, wethAddress);
    var tokenContract = new web3.eth.Contract(JSON.parse(fs.readFileSync('token.json', 'utf-8')), tokenAddress);

    var approveFunction = wethContract.methods.approve(
        routerAddress,
        amount
    );
    await sendKaramTransactions(address, approveFunction, wethAddress, null);

    var swapFunction = contract.methods.swapExactTokensForTokens(
        amount,
        '0',
        [
            wethAddress,
            tokenAddress,
        ],
        address,
        Math.floor(Date.now() / 1000) + 60 * 20
    );
    await sendKaramTransactions(address, swapFunction, routerAddress, null);


    // var tokenAmount = await tokenContract.methods.balanceOf(address).call();
    // console.log(tokenAmount);
    // var transferFunction = tokenContract.methods.transfer(destinationAddress, tokenAmount);
    // await sendKaramTransactions(address, transferFunction, tokenAddress, null);
}

example();
