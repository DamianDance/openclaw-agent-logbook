import { ethers } from "hardhat";

async function main() {
  const AgentLogbook = await ethers.getContractFactory("AgentLogbook");
  const agentLogbook = await AgentLogbook.deploy();
  await agentLogbook.waitForDeployment();

  const address = await agentLogbook.getAddress();
  console.log("AgentLogbook deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
