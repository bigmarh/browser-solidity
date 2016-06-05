// This mainly extracts the provider that might be
// supplied through mist.

var Web3 = require("web3");
var HookedWeb3Provider = require("hooked-web3-provider");
var Tx = require('ethereumjs-tx');
var provider = new HookedWeb3Provider({
    host: "http://localhost:8545", //"http://127.0.0.1:8545",
    transaction_signer: {
        hasAddress: function(address, callback) {
            callback(null, true);
        },
        signTransaction: function(txParams, callback) {

            function strip0x(input) {
                if (typeof(input) !== 'string') {
                    return input;
                } else if (input.length >= 2 && input.slice(0, 2) === '0x') {
                    return input.slice(2);
                } else {
                    return input;
                }
            }

            function add0x(input) {
                if (typeof(input) !== 'string') {
                    return input;
                } else if (input.length < 2 || input.slice(0, 2) !== '0x') {
                    return '0x' + input;
                } else {
                    return input;
                }
            }

            var ethjsTxParams = {};
            ethjsTxParams.from = add0x(currentAccount().address);
            ethjsTxParams.to = add0x(txParams.to);
            ethjsTxParams.gasLimit = add0x(3e6);
            ethjsTxParams.gasPrice = add0x(1);
            ethjsTxParams.nonce = add0x(txParams.nonce || new Date().getTime() + parseInt(Math.random() * 100));
            ethjsTxParams.value = add0x(txParams.value);
            ethjsTxParams.data = add0x(txParams.data);

            var tx = new Tx(ethjsTxParams);
            tx.sign(new Buffer(currentAccount().private, 'hex'));
            var serializedTx = '0x' + tx.serialize().toString('hex');

            callback(null, serializedTx);
        }
    }
});



web3 = new Web3(provider);


module.exports = web3;
