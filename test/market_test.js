const Dex = artifacts.require("Dex")
const Link = artifacts.require("link")
const truffleAssert=require('truffle-assertions');

contract ("Dex", accounts=> {

    it("Sell market order, Enought token for trade" , async() => {
        let dex = await Dex.deployed();
        //let link = await Link.deployed();

        let balances = await dex.balance(accounts[0],web3.utils.fromUtf8("LINK"));

        assert.equal(balances.toNumber,0,"The account is not initialised to 0");

        await truffleAssert.reverts(dex.createMarketOrder(1,web3.utils.fromUtf8("LINK"),10));
        
    })

    it("market order can be submitted even if the orderbook is empty" , async() =>{
        let dex = await Dex.deployed();

        await dex.depositEth({value : 5000});
        let orderbook = await dex.getOrderBook(web3.utils.fromUtf8("LINK"),0);
        assert(orderbook.length==0,"Orderbook is not 0");

        await truffleAssert.passes(dex.createMarketOrder(0,web3.utils.fromUtf8("LINK"),10));

    })

    it("market orders should not fill more than the market order amount",async() =>{
        let dex = await Dex.deployed();
        let link = await Link.deployed();

        let orderbook = await dex.getOrderBook(web3.utils.fromUtf8("LINK"),1);
        assert(orderbook.length==0,"Sell orderbook should be empty");

        //add token to dex

        await dex.addToken(web3.utils.fromUtf8("LINK"),link.address);

        //send token from account[0]
        await link.transfer(accounts[1],150);
        await link.transfer(accounts[2],150);
        await link.transfer(accounts[3],150);


        //approve token
        await link.approve(dex.address,50,{from: accounts[1]});
        await link.approve(dex.address,50,{from: accounts[2]});
        await link.approve(dex.address,50,{from: accounts[3]});


        //deposit link to dex

        await dex.deposit(web3.utils.fromUtf8("LINK"),50);
        await dex.deposit(web3.utils.fromUtf8("LINK"),50);
        await dex.deposit(web3.utils.fromUtf8("LINK"),50);

        //fill up the sell orderbook

        await dex.createLimitOrder(1,web3.utils.fromUtf8("LINK"),5,300, {from: accounts[1]});
        await dex.createLimitOrder(1,web3.utils.fromUtf8("LINK"),5,300, {from: accounts[1]});
        await dex.createLimitOrder(1,web3.utils.fromUtf8("LINK"),5,300, {from: accounts[1]});

        await dex.createMarketOrder(0,web3.utils.fromUtf8("LINK"),10);

        await dex.getOrderBook(web3.utils.fromUtf8("LINK"),1);

        assert(orderbook.length==1,"Should have only 1 orderbook left");

    })

    it("market orders should be filled until the orderbook is empty",async()=>{
        let dex = Dex.deployed();
        let link = Link.deployed();

        let orderbook = dex.getOrderBook(web3.utils.fromUtf8("LINK"),1);
        assert(orderbook.length==1,"Galat length aa rahi hai");

        //fill up the order book
        await dex.createLimitOrder(1,web3.utils.fromUtf8("LINK"),5,300,{from : accounts[1]});
        await dex.createLimitOrder(1,web3.utils.fromUtf8("LINK"),5,400,{from : accounts[2]});

        //check buyer balance before sale
        let beforeBalance=balance(accounts[0],web3.utils.fromUtf8("LINK"));

        //create market order for more than req
        await dex.createMarketOrder(0,web3.utils.fromUtf8("LINK"),500);

        //check after balance
        let afterBalance=balance(accounts[0],web3.utils.fromUtf8("LINK"));

        assert(beforeBalance.toNumber(), afterBalance.toNumber() - 15);
    })

    it("eth balance should decrease with filled amount",async() => {
        let dex = Dex.deployed();
        let link = Link.deployed();

        await link.approve(dex.address,500,{from : accounts[1]});
        await dex.createLimitOrder(1,web3.utils.from.fromUtf8("LINK"),1,300, {from : accounts[1]});

        let bf=dex.balances[accounts[0],web3.utils.fromUtf8("ETH")];

        await dex.createMarketOrder(0,web3.utils.fromUtf8("LINK"),1);

        let af=dex.balances[accounts[0],web3.utils.fromUtf8("ETH")];

        assert.equal(af.toNumber()+300, bf.toNumber());

    })

    it("the token balance of the limit order should decrease with filled amount",async() => {
        let dex = Dex.deployed();
        let link =Link.deployed();

        //get orderbook
        let orderbook = await dex.getOrderBook(web3.utils.fromUtf8("LINK"),1);
        assert(orderbook.length==0,"Length should be zero")

        //seller account[2] deposit link
        await link.approve(dex.address,500,{from : accounts[2]});
        await link.deposit(web3.utils.fromUtf32("LINK"),100);

        await dex.createLimitOrder(1,web3.utils.fromUtf32("LINK"),1,300,{from : accounts[1]});
        await dex.createLimitOrder(1,web3.utils.fromUtf32("LINK"),1,400,{from : accounts[2]});

        let bb1 = await dex.balances(accounts[1],web3.utils.fromUtf32("LINK"));
        let bb2 = await dex.balances(accounts[2],web3.utils.fromUtf32("LINK"));

        await dex.createMarketOrder(0,web3.utils.fromUtf32("LINK"),2);


        let ab1 = await dex.balances(accounts[1],web3.utils.fromUtf32("LINK"));
        let ab2 = await dex.balances(accounts[2],web3.utils.fromUtf32("LINK"));

        assert.equal(bb1.toNumber()-1,ab1.toNumber());
        assert.equal(bb2.toNumber()-1,ab2.toNumber());
    })

    it("filled limit orders should be removed from orderbook",async() =>{
        let dex=Dex.deployed();
        let link=Link.deployed();

        await dex.addToken(web3.utils.fromUtf32("LINK"),link.address);

        //Seller deposits link and creates a sell order

        await link.approve(dex.address,500);
        await dex.deposit(web3.utils.fromUtf32("LINK"),250);

        await dex.depositEth({value : 1000});

        let orderbook= await dex.getOrderBook(web3.utils.fromUtf32("LINK"),1);
        
        await dex.createLimitOrder(1,web3.utils.fromUtf32("LINK"),1,250);
        await dex.createMarketOrder(0,web3.utils.fromUtf32("LINK"),1);

        orderbook = await dex.getOrderBook(web3.utils.fromUtf32("LINK"),1);

        assert(orderbook.length==0);
    })

} )