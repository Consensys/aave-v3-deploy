import { ethers } from "hardhat";
import { AToken, Faucet, Pool, getContract } from "../helpers";
import { BigNumber } from "ethers";
import { waitForTx } from "../helpers/utilities/tx";

const main = async function () {
  const [signer] = await ethers.getSigners();
  const userAddress = signer.address;
  const usdtAddress = "0xB6338998b59692B1A84d694C0EB0d774105801Bc";
  const faucetAddress = "0xaF9FbFd0105C937cB87F8363F0F895EDe6ee72f0";
  const poolAddress = "0x4eA25f778C91D69f11c68c4af5C2841C863868E9";
  const amount = BigNumber.from(100000000);
  const amountToDeposit = BigNumber.from(10000000);
  const borrowSize = BigNumber.from(10);
  const interestRateMode = 2;
  const referralCode = "0";

  const faucetInstance = (await getContract("Faucet", faucetAddress)).connect(
    signer
  ) as Faucet;

  // Mint USDT token
  await faucetInstance.mint(usdtAddress, userAddress, amount);

  const poolInstance = (await getContract("Pool", poolAddress)).connect(
    signer
  ) as Pool;

  const usdtInstance = (await getContract("TestnetERC20", usdtAddress)).connect(
    signer
  ) as AToken;

  //Approve
  const approveTx = await usdtInstance
    .connect(signer)
    .approve(poolInstance.address, amount);
  await waitForTx(approveTx);

  const allowance = await usdtInstance.allowance(
    userAddress,
    poolInstance.address
  );
  console.log("Allowance:", allowance.toString());

  const userBalanceBefore = await usdtInstance.balanceOf(userAddress);
  console.log("User Balance before Deposit:", userBalanceBefore.toString());

  // Deposit
  const supplyTx = await poolInstance
    .connect(signer)
    .supply(usdtAddress, amountToDeposit, signer.address, referralCode);
  await waitForTx(supplyTx);

  const userBalance = await usdtInstance.balanceOf(userAddress);
  console.log("User Balance after Deposit:", userBalance.toString());

  // Enable the user's deposit as collateral
  const enableCollateralTx = await poolInstance
    .connect(signer)
    .setUserUseReserveAsCollateral(usdtAddress, true);

  await enableCollateralTx.wait();

  const userData = await poolInstance.getUserAccountData(userAddress);
  console.log("User Account Data:", userData);

  //Borrow USDT
  const borrowTx = await poolInstance
    .connect(signer)
    .borrow(
      usdtAddress,
      borrowSize,
      interestRateMode,
      referralCode,
      userAddress
    );
  await waitForTx(borrowTx);
};

main();
