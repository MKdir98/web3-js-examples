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

async function check() {
    db.exec(`
    CREATE TABLE IF NOT EXIST prices
    (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        token0   VARCHAR(50) NOT NULL,
        token1   VARCHAR(50) NOT NULL,
        router_1_address   VARCHAR(50) NOT NULL,
        router_2_address VARCHAR(50) NOT NULL,
        input BIGINT,
        output BIGINT,
        pure_output BIGINT
    );
    `);
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
                    db.run(`SELECT * from prices where token0='${row['token0']}' and token1='${row['token1']}' and router_1_address='${row['router_address']} and router_2_address='${row2['router_address']}`)
                    
                });
            });
        } catch (ex) {
            console.log(ex);
        }
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
}

check();
