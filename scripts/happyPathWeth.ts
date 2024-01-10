import { ethers } from "hardhat";
import { parseEther } from "ethers/lib/utils";
import { Pool, getContract } from "../helpers";
import { BigNumber } from "ethers";
import { waitForTx } from "../helpers/utilities/tx";

const main = async function () {
  const [signer] = await ethers.getSigners();
  const userAddress = "0x91ba6c8DE41deC8E4d4E1C858f00FaE1819990Ca";
  const wrappedTokenAddress = "0x8B8dAD7640036C81898Ea8EB6de884d825542188";
  const depositSize = BigNumber.from(100);
  const wethAddress = "0x06D8578257eaf3BC17233fD307730aBdD481972f";

  const poolAddressesInstance = (
    await getContract(
      "PoolAddressesProvider",
      "0xDcF6F8cF25A51d9AeDe91b1BF56Af616D66ecD90"
    )
  ).connect(signer);

  console.log(await poolAddressesInstance.getPool());

  const poolInstance = (
    await getContract("Pool", "0x4eA25f778C91D69f11c68c4af5C2841C863868E9")
  ).connect(signer) as Pool;

  const userData = await poolInstance.getUserAccountData(userAddress);
  console.log("User Account Data before:", userData);

  const wrappedTokenGateway = (
    await getContract("WrappedTokenGatewayV3", wrappedTokenAddress)
  ).connect(signer);
  const borrowSize = parseEther("1");

  // Deposit with native ETH
  await waitForTx(
    await wrappedTokenGateway
      .connect(signer)
      .depositETH(poolInstance.address, userAddress, "0", {
        value: depositSize,
      })
  );

  const userData2 = await poolInstance.getUserAccountData(userAddress);
  console.log("User Account Data after:", userData2);
  const reserveData = await poolInstance.getReserveData(wethAddress);
  console.log("Reserve Data:", reserveData);
  
  // Borrow WETH with WETH as collateral
  // await waitForTx(
  //   await poolInstance
  //     .connect(signer)
  //     .borrow(wethAddress, borrowSize, "2", "0", userAddress)
  // );
};

main();
