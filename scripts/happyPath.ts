import { ethers } from "hardhat";
import { AToken, Faucet, Pool, getContract } from "../helpers";
import { BigNumber } from "ethers";
import { waitForTx } from "../helpers/utilities/tx";
import { parseEther } from "ethers/lib/utils";

const main = async function () {
  const [signer] = await ethers.getSigners();
  const userAddress = "0x91ba6c8DE41deC8E4d4E1C858f00FaE1819990Ca";
  const usdtAddress = "0xB6338998b59692B1A84d694C0EB0d774105801Bc";
  const amount = BigNumber.from(100000000);
  const amountToDeposit = BigNumber.from(50000000);
  const borrowSize = BigNumber.from(10000000);
  const referralCode = 0;

  const faucetInstance = (
    await getContract("Faucet", "0xaF9FbFd0105C937cB87F8363F0F895EDe6ee72f0")
  ).connect(signer) as Faucet;

  // Mint USDT token
  await faucetInstance.mint(usdtAddress, userAddress, amount);

  const poolInstance = (
    await getContract("Pool", "0x4eA25f778C91D69f11c68c4af5C2841C863868E9")
  ).connect(signer) as Pool;

  //TODO: Find the right contract name for USDT-TestnetMintableERC20-Aave 

  const usdtInstance = (await getContract("TestnetERC20", usdtAddress)).connect(signer) as AToken;

  // Approve
  const approveTx = await usdtInstance.connect(signer).approve(userAddress, amount);
  await waitForTx(approveTx);

  // Deposit
  await poolInstance.deposit(usdtAddress, amountToDeposit, userAddress, referralCode);


  // Borrow USDT
  await poolInstance
    .connect(signer)
    .borrow(usdtAddress, borrowSize, "2", "0", userAddress);
};

main();
