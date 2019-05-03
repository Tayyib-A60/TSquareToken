var TSquareToken = artifacts.require("./TSquareToken.sol");

contract('TSquareToken', function(accounts) {
    var tokenInstance;
    it('initializes the contract with the correct values', function() {
        return TSquareToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.name();
    }).then(function(name) {
        assert.equal(name, 'AsixoCoin', 'has the correct name');
        return tokenInstance.symbol();
        }).then(function(symbol) {
            assert.equal(symbol, 'Asixo', 'has the correct symbol');
            return tokenInstance.standard();
        }).then(function(standard) {
            assert.equal(standard, 'Asixo token version 1.0', 'has the correct standard');
        });
    });
    it('sets the total supply', function() {
        return TSquareToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply) {
            assert.equal(totalSupply.toString(),1000000, 'sets the total supply to 1 million');
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(adminBalance) {
            assert.equal(adminBalance.toNumber(), 1000000, 'it allocates the initial supply to the admin account')
        });
    });
    
    it('transfers token ownership', function() {
        return TSquareToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.transfer.call(accounts[1], 9999999);
    }).then(assert.fail).catch(function(error) {
        assert(error.message.indexOf('revert') >= 0, 'error message contains revert');
        return tokenInstance.transfer.call(accounts[1], 25000, {from: accounts[0]});
    }).then(function(success) {
        assert.equal(success, true, 'it returns true')
        return tokenInstance.transfer(accounts[1], 25000, {from: accounts[0]});
    }).then(function(reciept) {
        assert.equal(reciept.logs.length, 1);
        assert.equal(reciept.logs[0].event, 'Transfer', 'should be the transfer event');
        assert.equal(reciept.logs[0].args._from, accounts[0], 'logs the account the token was tranferred from');
        assert.equal(reciept.logs[0].args._to, accounts[1], 'logs the account the token was tranferred to');
        assert.equal(reciept.logs[0].args._value, 25000, 'logs the account the token was tranferred to');
        return tokenInstance.balanceOf(accounts[1]);
    }).then(function(balance) {
        assert.equal(balance.toNumber(), 25000, 'adds the amount to the recieving account');
        return tokenInstance.balanceOf(accounts[0]);
    }).then(function(balance) {
        assert.equal(balance.toNumber(), 975000, 'deducts the amount sent from sending account');
        });
    });
    it('approves tokens for delegated transfer', function() {
        return TSquareToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.approve.call(accounts[1], 100);
        }).then(function(success) {
            assert.equal(success, true, 'returns true');
            return tokenInstance.approve(accounts[1], 100);
        }).then(function(reciept) {
            assert.equal(reciept.logs.length, 1);
            assert.equal(reciept.logs[0].event, 'Approval', 'should be the Approval event');
            assert.equal(reciept.logs[0].args._owner, accounts[0], 'logs the account the token was tranferred from');
            assert.equal(reciept.logs[0].args._spender, accounts[1], 'logs the account the token was tranferred to');
            assert.equal(reciept.logs[0].args._value, 100, 'logs the account the token was tranferred to');
            return tokenInstance.allowance(accounts[0], accounts[1]);
        }).then(function(allowance) {
            assert.equal(allowance.toNumber(), 100, 'stores the allowance for the delegated transfer');
        })
    });
    it('handles delegated transfer', function() {
        return TSquareToken.deployed().then(function(instance) {
            tokenInstance = instance;
            fromAccount = accounts[2];
            toAccount = accounts[3];
            spendingAccount = accounts[4];
            // Transfer some tokens to fromAccount
            return tokenInstance.transfer(fromAccount, 100), { from: accounts[0] };
        }).then(function(reciept) {
            // Approve spendingAccount to spend 10 tokens from fromAccount
            return tokenInstance.approve(spendingAccount, 10, { from: fromAccount})
        }).then(function(reciept) {
            // Try transferring something larger than the sender's balance
            return tokenInstance.transferFrom(fromAccount, toAccount, 999, { from: spendingAccount });
        }).then(assert.fail).catch(function(error) {
        assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than balance');
        // Try making a transfer larger than the approved amount
        return tokenInstance.transferFrom(fromAccount, toAccount, 20, { from: spendingAccount })
        }).then(assert.fail).catch(function(error) {
        assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than approved amount');
        return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount });
        }).then(function(success) {
            assert.equal(success, true, 'expects transfer to be successful');
            return tokenInstance.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount });
        }).then(function(reciept) {
            assert.equal(reciept.logs.length, 1);
            assert.equal(reciept.logs[0].event, 'Transfer', 'should be the Transfer event');
            assert.equal(reciept.logs[0].args._from, fromAccount, 'logs the account the token was tranferred from');
            assert.equal(reciept.logs[0].args._to, toAccount, 'logs the account the token was tranferred to');
            assert.equal(reciept.logs[0].args._value, 10, 'logs the account the token was tranferred to');
            return tokenInstance.balanceOf(fromAccount);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 90, 'deducts the transferred amount from the sending account');
            return tokenInstance.balanceOf(toAccount);
        }).then((balance) => {
            assert.equal(balance.toNumber(), 10, 'adds the transferred amount to the recieving account');
            return tokenInstance.allowance(fromAccount, spendingAccount);
        }).then((allowance) => {
            assert.equal(allowance.toNumber(), 0, 'deducts the amount from the allowance');
        })
    });
});