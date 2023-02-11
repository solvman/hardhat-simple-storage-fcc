const { ethers, run, network } = require("hardhat");

async function main() {
    const simpleStorageFactory = await ethers.getContractFactory(
        "SimpleStorage"
    );
    console.log("Deploying contract...");
    const simpleStorage = await simpleStorageFactory.deploy();
    const contract = await simpleStorage.deployed();
    console.log(`Contract deployed to:${contract.address}`);

    if (network.config.chainId === 5 && process.env.ETHERSCAN_API_KEY) {
        console.log("Waiting for contract verification...");
        await simpleStorage.deployTransaction.wait(6);
        await verify(contract.address, []);
    }

    // Retrieve current value
    const currentValue = await simpleStorage.retrieve();
    console.log(`Current Value is: ${currentValue}`);

    // Update the current value
    const transactionResponse = await simpleStorage.store(7);
    await transactionResponse.wait(1);
    const updateValue = await simpleStorage.retrieve();
    console.log(`Update value is: ${updateValue}`);
}

async function verify(contractAddress, args) {
    console.log("Verifying contract...");
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        });
    } catch (error) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log("Already verified!");
        } else {
            console.log(error);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
