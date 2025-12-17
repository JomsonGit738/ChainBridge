import { expect } from "chai";
import { ethers } from "hardhat";

describe("Counter", function () {
  it("increments and sets number", async function () {
    const Counter = await ethers.getContractFactory("Counter");
    const counter = await Counter.deploy();
    await counter.waitForDeployment();

    expect(await counter.number()).to.equal(0);

    await counter.setNumber(5);
    expect(await counter.number()).to.equal(5);

    await counter.increment();
    expect(await counter.number()).to.equal(6);
  });
});
