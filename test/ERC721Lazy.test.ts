import { loadFixture, ethers, expect } from "./setup";

describe("NFTLazyMinting", function () {
    async function deploy() {
        const [owner, user1, user2, user3] = await ethers.getSigners();
        const factory = await ethers.getContractFactory("NFTLazyMinting", owner);
        const nftLazyMinting = await factory.deploy();
        await nftLazyMinting.waitForDeployment()
        return { owner, user1, user2, user3, nftLazyMinting }
    }

    it("Deployment", async function () {
        const { owner, user1, user2, user3, nftLazyMinting } = await loadFixture(deploy);

    })
})