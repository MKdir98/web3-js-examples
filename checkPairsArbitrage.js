const fs = require('fs')
const db = require("./db");
const args = process.argv.slice(2);
const networkUrl = args[0];
const chainId = args[1];
const privateKeyString = args[2];
const address = args[3];
const arbitrageAddress = args[4];
const { Web3 } = require('web3');
const LegacyTransaction = require('@ethereumjs/tx').LegacyTransaction;
var web3 = new Web3(new Web3.providers.HttpProvider(networkUrl))
web3.handleRevert = true;
const Common = require('@ethereumjs/common').Common;

function getAmountOut(amountIn, reserveIn, reserveOut) {
    amountInWithFee = amountIn * 9975n;
    numerator = amountInWithFee * reserveOut;
    denominator = reserveIn * 10000n + amountInWithFee;
    return numerator / denominator;
}

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

async function opportunity(router1Address, router2Address, token0, token1, amount, gas) {
    var arbContract = new web3.eth.Contract(JSON.parse(fs.readFileSync('Arbitrage.json', 'utf-8')).abi, arbitrageAddress);
    await sendKaramTransactions(address, arbContract.methods.startArbitrage(
        router1Address,
        router2Address,
        token0,
        token1,
        amount,
        gas,
        Math.floor(Date.now() / 1000) + 60 * 20
    ), arbitrageAddress, null);
}

async function check() {
    while (true) {
        try {
            db.each(`SELECT * FROM pairs`, async (error, row) => {
                if (error) {
                    throw new Error(error.message);
                }
                db.each(`SELECT * FROM pairs WHERE token0='${row['token0']}' and token1='${row['token1']}' and ID!=${row['ID']}`, async (error, row2) => {
                    if (error) {
                        throw new Error(error.message);
                    }
                    if (row['token0'] == "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c") {
                        var attackAmount = 20000000000000000n;
                        var gas = 1000000000000000n;
                    } else {
                        var attackAmount = 1000000000000000000n;
                        var gas = 300000000000000000n;
                    }
                    var firstGetAmountOut = getAmountOut(attackAmount, BigInt(row['reserve_in']), BigInt(row['reserve_out'])) * BigInt(1000000 - row['buy_tax'] * 10000) / 1000000n;
                    var lastAmountOut = getAmountOut(firstGetAmountOut, BigInt(row2['reserve_out']), BigInt(row2['reserve_in'])) * BigInt(1000000 - row['sell_tax'] * 10000) / 1000000n;
                    // console.log(row['token1'] + " " + lastAmountOut + " " + 200000000000000000n);
                    if (lastAmountOut - gas > attackAmount) {
                        var message = row['router_address'] + " " + row2['router_address'] + " " + row['token0'] + " " + row['token1'] + " " + attackAmount + " " + (lastAmountOut - gas) + " " + row['reserve_in'] + " " + row['reserve_out'] + " " + firstGetAmountOut + " " + row2['reserve_out'] + " " + row2['reserve_in'];
                        try {
                            console.log(message);
                            await opportunity(row['router_address'], row2['router_address'], row['token0'], row['token1'], attackAmount, gas)
                        } catch (ex) {
                            console.log(row['reserve_in'] + " " + row['reserve_out'] + " " + row2['reserve_in'] + " " + row2['reserve_out']);
                            if (ex.innerError != undefined) {
                                console.log(message + " " + ex.innerError.message);
                            } else {
                                console.log(message + " " + ex.message);
                            }
                        }
                    }
                });
            });
        } catch (ex) {
            console.log(ex);
        }
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
}

check();
