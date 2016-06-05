window.balance = function(address, denomination) {
    return web3.fromWei(web3.eth.getBalance(address), denomination).toNumber()
}
window.users = [];
var accountComp = {
    controller: function(args) {
        var self = this;
        this.contracts = m.prop([]);
        this.setActiveAccount = function(e) {
            currentAccount(accounts[e.target.value]);
        }
        this.getAllBalances = function() {
            console.log("Account Balances");
            for (var i = 0; i < 4; i++) {
                console.log("user" + i + ":", web3.fromWei(web3.eth.getBalance(accounts['user' + i].address), "wei").toString(), "Wei")
            }
        }


    },
    view: function(ctrl) {
        return m('div', {"layout-gt-md":"row"}, [
            m('div', [m('label', "Current Account:"),
                m('select#currentAccount', { onchange: ctrl.setActiveAccount.bind(ctrl) },
                    Object.keys(accounts).map(function(key) {
                        return m('option', { value: key }, key);
                    }))
            ]),
            m('div#balance', "Balance: " + balance(currentAccount().address, 'ether') + " ether")


        ])
    }
}



m.mount(document.getElementById('accounts'), accountComp);

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
