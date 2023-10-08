const privateKey = '0x'''; // کلید خصوصی کیف پول شما

async function test() {
    Web3 = require('web3')
    if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask is installed!');
        window.ethereum.enable().then((accounts) => {
            const web3 = new Web3(window.ethereum);
            const tokenAddress = '0x4c06d9d28dcD0F55bd74e4fa77A3A5Acd929a247'; // آدرس توکن test
            const bnbAddress = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'; // آدرس BNB
            const routerAddress = '0x10ED43C718714eb63d5aA57B78B54704E256024E'; // PancakeSwap Router v2 Address
            var fs = require('fs');
            var jsonFile = "./abi.json";
            var parsed = JSON.parse(fs.readFileSync(jsonFile));
            var abi = parsed.abi;
            const router = new web3.eth.Contract(abi, routerAddress);
            const amountIn = '140373540'; // 1 Token
            const amountOutMin = '0';
            const path = [
                '0x4c06d9d28dcD0F55bd74e4fa77A3A5Acd929a247', // Token Address
                '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' // WBNB Address
            ];
            const to = '0xb94f7A0f89edd7408F7d86e055Ba7990087E38aB'; // Destination Address
            const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
            web3.eth.getAccounts().then((accounts) => {
                // Send the transaction
                router.methods.swapExactTokensForTokensSupportingFeeOnTransferTokens(
                    amountIn,
                    amountOutMin,
                    path,
                    to,
                    deadline
                ).send({
                    from: accounts[0],
                    gasPrice: web3.utils.toHex(web3.utils.toWei('5', 'gwei')),
                    gasLimit: web3.utils.toHex(300000), // You can use web3.eth.estimateGas to get this value
                }).then((receipt) => {
                    console.log(receipt);
                });
            });
        });
    } else {
        console.log('MetaMask is not installed!');
    }
}

test()