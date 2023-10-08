const args = process.argv.slice(2);
const networkUrl = args[0];
const chainId = args[1];
const privateKeyString = args[2];
const address = args[3];
const arbitrageAddress = args[4];

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

async function sendWeth() {
    var arbContract = new web3.eth.Contract(JSON.parse(fs.readFileSync('Arbitrage.json', 'utf-8')).abi, arbitrageAddress);
    while (true) {
        const routers = JSON.parse(fs.readFileSync('routers.json', 'utf-8'));
        for (router in routers) {
            router1Address = routers[router]['address'];
            dexes = routers[router]['dexes'];
            for (dex in dexes) {
                router2Address = dexes[dex]['address'];
                pairs = dexes[dex]['pairs']
                for (pair in pairs) {
                    token0 = pairs[pair]['token0'];
                    token1 = pairs[pair]['token1'];
                    try {
                        await sendKaramTransactions(address, arbContract.methods.startArbitrage(
                            router1Address,
                            router2Address,
                            token0,
                            token1,
                            "299000000000000000",
                            "0",
                            Math.floor(Date.now() / 1000) + 60 * 20
                        ), arbitrageAddress, null);
                        break;
                    } catch (ex) {
                        if (ex.innerError != undefined) {
                            console.log(router1Address + " " + router2Address + " " + token1 + " " + ex.innerError.message);
                        } else {
                            console.log(router1Address + " " + router2Address + " " + token1 + " " + ex.message);
                        }
                    }
                    try {
                        await sendKaramTransactions(address, arbContract.methods.startArbitrage(
                            router2Address,
                            router1Address,
                            token0,
                            token1,
                            "299000000000000000",
                            "0",
                            Math.floor(Date.now() / 1000) + 60 * 20
                        ), arbitrageAddress, null);
                        break;
                    } catch (ex) {
                        if (ex.innerError != undefined) {
                            console.log(router2Address + " " + router1Address + " " + token1 + " " + ex.innerError.message);
                        } else {
                            console.log(router2Address + " " + router1Address + " " + token1 + " " + ex.message);
                        }
                    }
                }
            }
        }
    }
}

sendWeth();
