var unitMap = {
    'wei': '1',
    'shannon': '1000000000',
    'szabo': '1000000000000',
    'finney': '1000000000000000',
    'ether': '1000000000000000000'
};
var walletComp = {
    controller: function() {
        self = this;
        this.sendTo = m.prop(accounts['user0'].address);
        this.sendAmount = m.prop(1e18);
        this.sendDenomination = m.prop('wei');
        this.transfer = function() {
            if (!this.sendAmount()) return alert("Error: Please add an amount to send.");
            var tx = {
                from: currentAccount().address,
                to: this.sendTo(),
                gas: 3e6,
                value: this.sendAmount() * unitMap[this.sendDenomination()]
            };
            web3.eth.sendTransaction(tx, function() {
                m.startComputation();
                self.sendAmount("");
                m.endComputation();
                console.log(arguments)
                if (!arguments[1]) return alert(arguments[0]);
                alert("Transaction Sent! \n txid: " + arguments[1]);
            });
        }
    },
    view: function(ctrl) {
        return m('div#wallet', [
            m('div#chooseAccount', [
                m('strong#label', "Choose Account: "),
                Object.keys(accounts).map(function(key) {
                    if (key != "primary")
                        return m('button.waves-effect.waves-light.waves-ripple.btn-small.orange.lighten-3.hoverable', {
                            onclick: function() { ctrl.sendTo(accounts[key].address) }
                        }, key)
                })
            ]),
            m('div', { "layout-gt-md": "row", "layout-align": "space-between" }, [
                m('div', { flex: 50 }, [
                    m('label', 'Address:'),
                    m('input', {
                        value: ctrl.sendTo(),
                        onchange: m.withAttr("value", ctrl.sendTo)
                    })
                ]),
                m('div', { flex: 45, "layout-gt-md": "row" }, [
                    m("div", [m('label', 'Amount:'),
                        m('input', {
                            value: ctrl.sendAmount(),
                            onchange: m.withAttr("value", ctrl.sendAmount)
                        })
                    ]),
                    m("div.input-field.col.s12", [m('select', { onchange: m.withAttr("value", ctrl.sendDenomination), value: ctrl.sendDenomination() }, [
                        Object.keys(unitMap).map(function(denomination) {
                            return m('option', { value: denomination }, denomination);
                        })
                    ])])

                ])
            ]),
            m('div', { "layout-gt-md": "row", "layout-align": "end" }, [
                m('button#sendButton.btn-small.waves-effect.waves-light.waves-ripple.green.lighten-3.hoverable', { onclick: ctrl.transfer.bind(ctrl) }, "Transfer")
            ])



        ])
    }
}

m.mount($('#walletView')[0], walletComp)
