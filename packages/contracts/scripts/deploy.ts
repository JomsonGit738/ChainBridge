import fs from "fs";
import path from "path";
import { ethers, network } from "hardhat";

async function main() {
  const Counter = await ethers.getContractFactory("Counter");
  const counter = await Counter.deploy();
  await counter.waitForDeployment();

  const address = await counter.getAddress();
  const chainId = network.config.chainId ?? 31337;

  const artifactPath = path.resolve(__dirname, "../artifacts/contracts/Counter.sol/Counter.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const frontendTarget = path.resolve(__dirname, "../../..", "apps/web/src/contracts");
  fs.mkdirSync(frontendTarget, { recursive: true });

  const payload = {
    address,
    abi: artifact.abi,
    chainId
  };

  fs.writeFileSync(path.join(frontendTarget, "Counter.json"), JSON.stringify(payload, null, 2));
  console.log(`Counter deployed to ${address} on chainId ${chainId}`);
  console.log(`Wrote ABI + address to apps/web/src/contracts/Counter.json`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
