var fs = require('fs')
const { Web3 } = require('web3');
var Common = require('ethereumjs-common').default;
const Tx = require('ethereumjs-tx');
var privateKeyString = '5d25e180187a5c43b486741d5cc61f577657a63eccb3a68fc16db46cabc37888';
var web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'))
web3.handleRevert = true;
var privateKey = Buffer.from(privateKeyString, 'hex');
chainId = 1337;

async function sendKaramTransactions(from, sendFunction, to, value) {
    var count = await web3.eth.getTransactionCount(from);
    var gasPrice = await web3.eth.getGasPrice();
    var gasLimit = 300000;
    var rawTransaction = {
        "gasPrice": web3.utils.toHex(gasPrice),
        "gasLimit": web3.utils.toHex(gasLimit),
        "to": to,
        "data": sendFunction.encodeABI(),
        "nonce": web3.utils.toHex(count),
        "chainId": chainId
    };
    if (value) {
        rawTransaction['value'] = value;
    }

    var transaction = new Tx(rawTransaction);
    transaction.sign(privateKey);
    console.log('0x' + transaction.serialize().toString('hex'));
    var result = await web3.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'));
    console.log(result);
}

async function test2() {
    var address = '0xf92F60DEE01ea3d93a641B278d89195d747EB7C7';
    var routerAddress = '0xB6bdACa6bf013DF135FAcf76c83De2cb8a302B8C'; // Uniswap Router v2 Address
    var tokenAddress = '0x63696B9FD16B681b56Ca17829dAD200Ef043A1b9';
    var wethAddress = '0x8aDbd7126Aa3B581152a5F652C9B638b75B127b9';
    var contract = new web3.eth.Contract(JSON.parse(fs.readFileSync('abi.json', 'utf-8')).abi, routerAddress);
    var tokenContract = new web3.eth.Contract(JSON.parse(fs.readFileSync('token.json', 'utf-8')), tokenAddress);
    var wethContract = new web3.eth.Contract(JSON.parse(fs.readFileSync('weth.json', 'utf-8')).abi, wethAddress);

    await sendKaramTransactions(address, wethContract.methods.deposit(), wethAddress, 1000000000000000000)

    console.log(await wethContract.methods.balanceOf(address).call())

    var approveFunction = wethContract.methods.approve(
        routerAddress,
        '1000000000000000000'
    );
    await sendKaramTransactions(address, approveFunction, wethAddress, null);

    var swapFunction = contract.methods.swapExactTokensForTokensSupportingFeeOnTransferTokens(
        '3000000000',
        '0',
        [
            wethAddress,
            tokenAddress,
        ],
        address,
        Math.floor(Date.now() / 1000) + 60 * 20
    );
    await sendKaramTransactions(address, swapFunction, routerAddress, null);

    // var buyToken = contract.methods.swapExactETHForTokensSupportingFeeOnTransferTokens(
    //     '45242190834836780366560',
    //     [
    //         wethAddress,
    //         tokenAddress
    //     ],
    //     address,
    //     Math.floor(Date.now() / 1000) + 60 * 20
    // )
    // await sendKaramTransactions(address, buyToken, routerAddress, 1000000000000000000);
}

test2();
