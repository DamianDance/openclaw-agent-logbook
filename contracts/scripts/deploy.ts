import { ethers } from "hardhat";

async function main() {
  const TaskLedger = await ethers.getContractFactory("TaskLedger");
  const taskLedger = await TaskLedger.deploy();
  await taskLedger.waitForDeployment();

  const address = await taskLedger.getAddress();
  console.log("TaskLedger deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
