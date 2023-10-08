const args = process.argv.slice(2);
const networkUrl = args[0];
const chainId = args[1];
const privateKeyString = args[2];
const address = args[3];
const routerAddress = args[4];
const wethAddress = args[5];
const tokenAddress = args[6];
const amount = args[7];
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

async function buy() {
    var contract = new web3.eth.Contract(JSON.parse(fs.readFileSync('abi.json', 'utf-8')).abi, routerAddress);
    var wethContract = new web3.eth.Contract(JSON.parse(fs.readFileSync('weth.json', 'utf-8')).abi, wethAddress);
    var tokenContract = new web3.eth.Contract(JSON.parse(fs.readFileSync('token.json', 'utf-8')), tokenAddress);

    // var approveFunction = wethContract.methods.approve(
    //     routerAddress,
    //     amount
    // );
    // await sendKaramTransactions(address, approveFunction, wethAddress, null);

    // var swapFunction = contract.methods.swapExactTokensForTokens(
    //     amount,
    //     '0',
    //     [
    //         wethAddress,
    //         tokenAddress,
    //     ],
    //     address,
    //     Math.floor(Date.now() / 1000) + 60 * 20
    // );
    // await sendKaramTransactions(address, swapFunction, routerAddress, null);


    var tokenAmount = await tokenContract.methods.balanceOf(address).call();
    console.log("start transfer")
    console.log(tokenAmount);
    // var transferFunction = tokenContract.methods.transfer(destinationAddress, tokenAmount);
    // await sendKaramTransactions(address, transferFunction, tokenAddress, null);
}

buy();
