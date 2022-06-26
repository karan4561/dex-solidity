const Dex = artifacts.require("Dex")
const Link = artifacts.require("link")
const truffleAssert=require('truffle-assertions');

contract("Dex", accounts => {
    it("ETH balance is less than buy limit value", async() => {
       // await deployer.deploy(link);
        let dex = await Dex.deployed();
        let link = await Link.deployed();

        await truffleAssert.reverts(dex.createLimitOrder(0,web3.utils.fromUtf8("LINK"),10,1))

        //await dex.deposit(web3.utils.fromUtf8("LINK"),50);

        await dex.depositEth({value: 50})

        await truffleAssert.passes(dex.createLimitOrder(0,web3.utils.fromUtf8("LINK"),10,1))

 
    })

    it("throw error when token balance is too low when creating sell limit order", async() => {
        let dex=await Dex.deployed();
        let link = await Link.deployed();
        
        await truffleAssert.reverts(dex.createLimitOrder(1,web3.utils.fromUtf8("LINK"),10,1));
        await link.approve(dex.address,500);

        await dex.addToken(web3.utils.fromUtf8("LINK"),link.address,{from: accounts[0]});

        await dex.deposit(web3.utils.fromUtf8("LINK"),100);

        await truffleAssert.passes(dex.createLimitOrder(0,web3.utils.fromUtf8("LINK"),10,1));
    })

    it("should withdraw the token correctly", async() => {
        let dex=await Dex.deployed();
        let link = await Link.deployed();
        await link.approve(dex.address,500);
        await dex.depositEth({value:5000});

        await (dex.createLimitOrder(0,web3.utils.fromUtf8("LINK"),10,300));
        await (dex.createLimitOrder(0,web3.utils.fromUtf8("LINK"),10,100));
        await (dex.createLimitOrder(0,web3.utils.fromUtf8("LINK"),10,200));

        let orderbook = await dex.getOrderBook(web3.utils.fromUtf8("LINK"),0);
        console.log(orderbook);

        for(let i=0;i<orderbook.length-1;i++){
            assert(orderbook[i].price>=orderbook[i+1].price,"Mat karo yaar!");
        }

    
    })
});