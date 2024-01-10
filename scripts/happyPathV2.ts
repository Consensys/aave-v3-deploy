import { ethers } from "hardhat";
import { AToken, Faucet, Pool, getContract } from "../helpers";
import { BigNumber } from "ethers";
import { waitForTx } from "../helpers/utilities/tx";
import { parseEther } from "ethers/lib/utils";

const main = async function () {
  const [signer] = await ethers.getSigners();
  const userAddress = signer.address;
  const usdtAddress = "0xa09AB0CdD6DF1F4c4a0327d26C3b674c35de7dDE";
  const aUsdtAddress = "0xE3D71d7D8008d9FA85Fa17B15d01FD9a98481D45";
  const faucetAddress = "0xefaF7d1334B3DAcb3d786565caC99bb6754caaf8";
  const poolAddress = "0x83BDf0Cac3e014Cf0E9C69d3A08444981322d534";
  const amountToDeposit = BigNumber.from(50000000);
  const amountToBorrow = BigNumber.from(1000000);
  const referralCode = 0;

  const faucetInstance = (await getContract("Faucet", faucetAddress)).connect(
    signer
  ) as Faucet;

  const poolInstance = (await getContract("Pool", poolAddress)).connect(
    signer
  ) as Pool;

  const usdtInstance = (await getContract("TestnetERC20", usdtAddress)).connect(
    signer
  ) as AToken;

  const aUsdtInstance = (await getContract("AToken", aUsdtAddress)).connect(
    signer
  ) as AToken;

  const setUserUseReserveAsCollateralTx =
    await poolInstance.setUserUseReserveAsCollateral(usdtAddress, true);
  await waitForTx(setUserUseReserveAsCollateralTx);

  // Mint USDT token
  await faucetInstance.mint(usdtAddress, userAddress, amountToDeposit);

  // Approve
  const approveTx = await usdtInstance
    .connect(signer)
    .approve(poolAddress, amountToDeposit);
  await waitForTx(approveTx);

  // Deposit
  const supplyTx = await poolInstance.supply(
    usdtAddress,
    amountToDeposit,
    userAddress,
    referralCode
  );

  await waitForTx(supplyTx);

  // Borrow USDT
  const borrowTx = await poolInstance
    .connect(signer)
    .borrow(usdtAddress, amountToBorrow, "2", "0", userAddress);
  await waitForTx(borrowTx);

  const aUsdtBalance = await aUsdtInstance.balanceOf(userAddress);
  console.log({ aUsdtBalance });

  const usdtReserveData = await poolInstance.getReserveData(usdtAddress);
  console.log({ usdtReserveData });

  const usdtConfiguration = await poolInstance.getConfiguration(usdtAddress);
  console.log({ usdtConfiguration });

  const userConfiguration = await poolInstance.getUserConfiguration(
    userAddress
  );
  console.log({ userConfiguration });

  const userAccountData = await poolInstance.getUserAccountData(userAddress);
  console.log({ userAccountData });
};

main();
