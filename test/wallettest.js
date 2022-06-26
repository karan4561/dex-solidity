const Dex = artifacts.require("Dex")
const Link = artifacts.require("link")
const truffleAssert=require('truffle-assertions');

contract("Dex", accounts => {
    it("should only be possible to add token", async() => {
       // await deployer.deploy(link);
  let dex = await Dex.deployed();
  let link = await Link.deployed();
  //await link.approve(wallet.address,500);

  await truffleAssert.passes(dex.addToken(web3.utils.fromUtf8("LINK"),link.address,{from: accounts[0]}));
 
    })

    it("should deposit the token correctly", async() => {
        let dex=await Dex.deployed();
        let link = await Link.deployed();
        await link.approve(dex.address,500);
        await dex.deposit(web3.utils.fromUtf8("LINK"),100);
        let b = await dex.balance(accounts[0],web3.utils.fromUtf8("LINK"));
        assert.equal(b.toNumber(),100);
    })
});