var fs = require('fs')
const { Web3 } = require('web3');
var Common = require('ethereumjs-common').default;
const Tx = require('ethereumjs-tx');
var privateKeyString = '''';
var web3 = new Web3(new Web3.providers.HttpProvider('https://ethereum-sepolia.blockpi.network/v1/rpc/public'))
web3.handleRevert = true;
var privateKey = Buffer.from(privateKeyString, 'hex');


async function sendKaramTransactions(from, sendFunction, to) {
    var count = await web3.eth.getTransactionCount(from);
    var gasPrice = await web3.eth.getGasPrice();
    var gasLimit = 300000;
    var rawTransaction = {
        "gasPrice": web3.utils.toHex(gasPrice),
        "gasLimit": web3.utils.toHex(gasLimit),
        "to": to,
        "data": sendFunction.encodeABI(),
        "nonce": web3.utils.toHex(count),
        "chainId": 11155111
    };

    var transaction = new Tx(rawTransaction);
    transaction.sign(privateKey);
    console.log('0x' + transaction.serialize().toString('hex'));
    var result = await web3.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'));
    console.log(result);
}

async function test2() {
    var address = '0xd83d223f93AC1420057cf9B873157CBD88CafA5d';
    const routerAddress = '0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008'; // Uniswap Router v2 Address
    var routerAbi = JSON.parse(fs.readFileSync('abi.json', 'utf-8'));
    var contract = new web3.eth.Contract(routerAbi.abi, routerAddress);
    var tokenAddress = '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984';
    var wethAddress = '0xfff9976782d46cc05630d1f6ebab18b2324d6b14';
    var tokenAbi = JSON.parse(fs.readFileSync('token.json', 'utf-8'));
    var tokenContract = new web3.eth.Contract(tokenAbi, wethAddress);

    var events = await contract.getPastEvents();
    console.log(events);

    const amountIn = '1'; // 1 Token
    const amountOutMin = '0';
    const path = [
        // '0x8343e1d4c80a29b77cf9f8f6cb98b62bc0fb93d7', // Token Address
        wethAddress, // WETH fake Address
        tokenAddress, // UNI Address
        // '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' // WBNB Address
    ];
    // const to = '0xb94f7A0f89edd7408F7d86e055Ba7990087E38aB'; // Destination Address
    const to = address;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time

    console.log(await tokenContract.methods.allowance(address, routerAddress).call());

    var approveFunction = tokenContract.methods.approve(
        routerAddress,
        amountIn
    );
    await sendKaramTransactions(address, approveFunction, wethAddress);


    var swapFunction = contract.methods.swapExactTokensForTokensSupportingFeeOnTransferTokens(
        amountIn,
        amountOutMin,
        path,
        to,
        deadline
    );
    await sendKaramTransactions(address, swapFunction, routerAddress);
}

test2();
