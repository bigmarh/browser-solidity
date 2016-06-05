fluentContract = {};
potContract = {}
window.balance = function(address,denomination){ return web3.fromWei(web3.eth.getBalance(address),denomination).toNumber()}

window.users = [];
var contracts = {
    controller: function(args) {
        var self = this;
        this.contracts = m.prop([]);

        this.getAllBalances = function() {
            console.log("Account Balances");
            for (var i = 0; i < 4; i++) {
                console.log("user" + i + ":", web3.fromWei(web3.eth.getBalance(accounts['user' + i].address), "wei").toString(), "Wei")
            }
        }
        this.sendTrans = function() {
            var self = this;
            userNumber = prompt("Which User would you like to send it to?", 0);
            amount = prompt("How Much Would you like to send?", 1e18);
            if (userNumber)
                web3.eth.sendTransaction({
                    from: accounts.primary.address,
                    fromObj: accounts.primary,
                    to: accounts['user' + userNumber].address,
                    value: amount,
                    gas: 7e4,
                    gasPrice: 10
                }, function(err, result) {
                    if (err != null) {
                        console.log(err);
                        console.log("ERROR: Transaction didn't go through. See console.");
                    } else {
                        console.log("Transaction Successful!");
                        console.log(err, result);
                    }
                })
        }
        this.createContract = function() {
            var argsArray = [];
            var gas = prompt('How much', web3.eth.getBlock('latest').gasLimit);
            var gasPrice = prompt("At what price", 1);
            var contractName = prompt("What Contract would you like to initiate?", "fluent");
            m.request({ method: "GET", url: "/accounts/createContract?contract=" + contractName }).then(function(result) {
                for (contract in result) {
                    if (contract == contractName) {
                        console.log(result[contract]);
                        var parsed = JSON.parse(result[contract].interface);
                        var MyContract = web3.eth.contract(parsed);
                        console.log("Call New Contract", MyContract);
                        if (contract == contractName) {
                            for (var i = 0; i < parsed.length; i++) {
                                if (parsed[i].type == "constructor") {
                                    parsed[i].inputs.map(function(input) {
                                        value = prompt("Set " + input.name + "(" + input.type + ")")
                                        argsArray.push(value);
                                    })
                                }
                            }
                        }
                        argsArray = argsArray.concat([{
                            nonce: new Date().getTime() + parseInt(Math.random() * 100),
                            data: result[contract].bytecode,
                            gas: gas,
                            gasPrice: gasPrice,
                            from: accounts.primary.address,
                            fromObj: accounts.primary
                        }, function(err, myContract) {
                            console.log(err, myContract);
                            if (err) throw err.message;
                            if (!err) {
                                // NOTE: The callback will fire twice!
                                // Once the contract has the transactionHash property set and once its deployed on an address.
                                // e.g. check tx hash on the first call (transaction send)
                                if (!myContract.address) {
                                    console.log(myContract);
                                    console.log(myContract.transactionHash) // The hash of the transaction, which deploys the contract

                                    // check address on the second call (contract deployed)
                                } else {
                                    console.log(myContract.address) // the contract address
                                    localStorage["contract-" + contract] = myContract.address;
                                }

                                // Note that the returned "myContractReturned" === "myContract",
                                // so the returned "myContractReturned" object will also get the address set.
                            }
                        }])
                        console.log(argsArray);
                        MyContract.new.apply(MyContract, argsArray);
                    }
                }
            })
        }

        this.registerUser = function() {
            var username = prompt("Whatjoname?", "Lamar")
            var address = prompt("Whatjodress? ", accounts.user0.address);
            var user = new Parse.Object('Wallets');
            user.save({
                username: username,
                address: address
            }).then(function(result, error) {
                console.log(result, error);
            })
        }
        var query = new Parse.Query('Wallets');
        query.find().then(function(results) {
            users = results.map(function(user) {
                return user.attributes;

            })
            m.redraw();
        });
        console.log("Loaded")

        this.getPotInstance = function(address) {
            if (Object.keys(potContract).length > 0) return;
            potContract = web3.eth.contract(JSON.parse('[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"bytes32"}],"type":"function"},{"constant":false,"inputs":[],"name":"getKey","outputs":[{"name":"_key","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"winAddress","type":"address"}],"name":"setWinner","outputs":[],"type":"function"},{"inputs":[{"name":"_name","type":"bytes32"}],"type":"constructor"}]')).at("0x07cedef1fe565a810856665dcb76644202718755");
        }
        this.getFluentInstance = function(address) {
            if (Object.keys(fluentContract).length > 0) return;
            var query = new Parse.Query('Contract');
            query.equalTo('name', 'fluent');
            query.descending('createdAt');
            return query.first().then(function(result) {
                fluentContract = web3.eth.contract(JSON.parse(result.get('abi'))).at("0xf95583095748d0b6e21fe79c5e0740538c1f7e31");
                console.log("Fluent Contract Set");
                m.redraw()
                return fluentContract;
            })

        }
        this.getFluentInstance();
        this.getPotInstance();
    },
    view: function(ctrl) {
        return m('div', [
            m('button', { onclick: ctrl.createContract.bind(this) }, "Create Contracts"),
            m('button', { onclick: ctrl.getFluentInstance.bind(this) }, "Load Fluent Contract"),
            m('button', { onclick: ctrl.sendTrans.bind(this) }, "Send Transaction"),
            m('button', { onclick: ctrl.getAllBalances.bind(this) }, "Get All Balances"),
            m('button', { onclick: ctrl.registerUser.bind(this) }, "Register User"),
            m('ol',
                users.map(function(user) {
                    return m('li', {
                        onclick: function() {
                            var amount = prompt("How Much would you like to send " + user.username, 0)
                            var memo = prompt("What is it for?", "Pizza");
                            if (!amount) return false;
                            fluentContract.transfer.sendTransaction(user.address, amount, memo, { from: accounts.user0.address, fromObj: accounts.user0, gas: 8e5, gasPrice: 1 }, function(err, result) {
                                console.log(err, result)

                            })
                        }
                    }, user.username + ": " + user.address + ": balance: " + fluentContract.balanceOf(user.address).toNumber());
                })
            )

        ])
    }
}



m.mount(document.body, contracts);

/*

FLuent 0xf95583095748d0b6e21fe79c5e0740538c1f7e31
Restricted Users 0xa341304a4454f14120eaa25256b798753c1feb70
*/
//first ones 
//0xe1d2e10c366965781d243bd99fe7a48158f5b1bc8b0cb6980e08b1208f1d2fc5
//0xb3096ef24dde9d8daaa738fc0728e52001fbb3355ada9f185dee1352712831f0

//secondTry
//0x1d8a306f86d4b83b01b06dc24ddb47b12cc8ea27a12721dff4e458b07c9b333d
//0xba19ca07bd52583f5e9d41e172bdcf94abeff7dd2cd546abe50c239f744853f0


//thridtry fluent second contract
//0x352210af12dba82f190aac9511cf3ad27bc709e66499ab1c0c1f75b850b09e88
//0xb5dc2394c9c7a1d8df970e4256ce9761d5351d8a37e5d3c9e3989743e0271512
