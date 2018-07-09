const Blockchain = require('./blockchain');
const fs = require("fs");

let jsChain = new Blockchain();
jsChain.createBlock({amount: 5});

const addBlockToJson = async () => {
  await fs.writeFileSync('./blockchain.json', JSON.stringify(jsChain), 'utf-8');
};

addBlockToJson().then(() => {
  console.log(JSON.stringify(jsChain, null, 4));
  console.log("Is blockchain valid? " + jsChain.checkValid());
}).catch(err => {
  throw new Error(err)
});