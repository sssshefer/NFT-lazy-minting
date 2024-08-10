import { loadFixture, ethers, expect } from "./setup";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { NFTLazyMinting } from "../typechain-types";

interface LazyRedeemMessage {
    tokenId: number | string,
    minPrice: number,
    uri: string
}

interface RSV {
    r: string,
    s: string,
    v: number
}

interface Domain {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
}

function createTypedData(message: LazyRedeemMessage, domain: Domain) {
    return {
        types: {
            NFTVoucher: [
                { name: "tokenId", type: "uint256" },
                { name: "minPrice", type: "uint256" },
                { name: "uri", type: "string" },
            ]
        },
        primaryType: "NFTVoucher",
        domain,
        message,
    };
}

function splitSignatureToRSV(signature: string): RSV {
    const r = '0x' + signature.substring(2).substring(0, 64);
    const s = '0x' + signature.substring(2).substring(64, 128);
    const v = parseInt(signature.substring(2).substring(128, 130), 16);

    return { r, s, v };
}

async function signLazyMint(
    token: string,
    tokenId: string | number,
    minPrice: number,
    uri: string,
    signer: SignerWithAddress
): Promise<LazyRedeemMessage & RSV> {

    const message: LazyRedeemMessage = {
        tokenId,
        minPrice,
        uri
    }
    const defaultHardhatChainId = 31337;
    const domain: Domain = {
        name: "ShefNFT",
        version: "1",
        chainId: defaultHardhatChainId,
        verifyingContract: token
    };

    const typedData = createTypedData(message, domain);

    const rawSignature = await signer.signTypedData(
        typedData.domain,
        typedData.types,
        typedData.message
    );

    const sig = splitSignatureToRSV(rawSignature);

    return { ...sig, ...message };
}


describe("NFTLazyMinting", function () {
    async function deploy() {
        const [owner, user1, user2, user3] = await ethers.getSigners();
        const factory = await ethers.getContractFactory("NFTLazyMinting", owner);
        const shefNFT: NFTLazyMinting = await factory.deploy("ShefNFT", "SHEF");
        await shefNFT.waitForDeployment();
        return { owner, user1, user2, user3, shefNFT }
    }

    it("Should redeem", async function () {
        const { owner, user1, user2, user3, shefNFT } = await loadFixture(deploy);

        const redeemerAddr = user1.address;
        const tokenId = 1;
        const minPrice = 100;
        const uri = "exampleShefNFT.com";

        const signedMessage = await signLazyMint(
            await shefNFT.getAddress(),
            tokenId,
            minPrice,
            uri,
            owner
        )

        const tx = await shefNFT.connect(user1).redeem(
            owner.address,
            redeemerAddr,
            signedMessage.tokenId,
            signedMessage.minPrice,
            signedMessage.uri,
            signedMessage.v,
            signedMessage.r,
            signedMessage.s,
            { value: minPrice }
        )
        await tx.wait();

        expect(await shefNFT.ownerOf(tokenId)).to.eq(redeemerAddr);
        expect(await shefNFT.availableToWithdraw(owner)).to.eq(minPrice);
        expect(await shefNFT.tokenURI(tokenId)).to.eq(uri);
    })

    it("Should fail to redeem with insufficient funds", async function () {
        const { owner, user1, shefNFT } = await loadFixture(deploy);

        const redeemerAddr = user1.address;
        const tokenId = 2;
        const minPrice = 200;
        const uri = "exampleShefNFT2.com";

        const signedMessage = await signLazyMint(
            await shefNFT.getAddress(),
            tokenId,
            minPrice,
            uri,
            owner
        );

        await expect(
            shefNFT.connect(user1).redeem(
                owner.address,
                redeemerAddr,
                signedMessage.tokenId,
                signedMessage.minPrice,
                signedMessage.uri,
                signedMessage.v,
                signedMessage.r,
                signedMessage.s,
                { value: minPrice - 50 }
            )
        ).to.be.revertedWith("Insufficient funds to redeem");
    });

    it("Should fail to redeem the same token twice", async function () {
        const { owner, user1, shefNFT } = await loadFixture(deploy);

        const redeemerAddr = user1.address;
        const tokenId = 3;
        const minPrice = 150;
        const uri = "exampleShefNFT3.com";

        const signedMessage = await signLazyMint(
            await shefNFT.getAddress(),
            tokenId,
            minPrice,
            uri,
            owner
        );

        const tx = await shefNFT.connect(user1).redeem(
            owner.address,
            redeemerAddr,
            signedMessage.tokenId,
            signedMessage.minPrice,
            signedMessage.uri,
            signedMessage.v,
            signedMessage.r,
            signedMessage.s,
            { value: minPrice }
        );
        await tx.wait();

        await expect(
            shefNFT.connect(user1).redeem(
                owner.address,
                redeemerAddr,
                signedMessage.tokenId,
                signedMessage.minPrice,
                signedMessage.uri,
                signedMessage.v,
                signedMessage.r,
                signedMessage.s,
                { value: minPrice }
            )
        ).to.be.reverted;
    });

    it("Should fail to redeem with an invalid signature", async function () {
        const { owner, user1, user2, shefNFT } = await loadFixture(deploy);

        const redeemerAddr = user1.address;
        const tokenId = 4;
        const minPrice = 250;
        const uri = "exampleShefNFT4.com";

        const invalidUser = user2;
        const signedMessage = await signLazyMint(
            await shefNFT.getAddress(),
            tokenId,
            minPrice,
            uri,
            invalidUser
        );

        await expect(
            shefNFT.connect(user1).redeem(
                owner.address,
                redeemerAddr,
                signedMessage.tokenId,
                signedMessage.minPrice,
                signedMessage.uri,
                signedMessage.v,
                signedMessage.r,
                signedMessage.s,
                { value: minPrice }
            )
        ).to.be.reverted;
    });

    it("Should allow the owner to withdraw funds after a successful redemption", async function () {
        const { owner, user1, shefNFT } = await loadFixture(deploy);

        const redeemerAddr = user1.address;
        const tokenId = 5;
        const minPrice = 300;
        const uri = "exampleShefNFT5.com";

        const signedMessage = await signLazyMint(
            await shefNFT.getAddress(),
            tokenId,
            minPrice,
            uri,
            owner
        );

        const tx = await shefNFT.connect(user1).redeem(
            owner.address,
            redeemerAddr,
            signedMessage.tokenId,
            signedMessage.minPrice,
            signedMessage.uri,
            signedMessage.v,
            signedMessage.r,
            signedMessage.s,
            { value: minPrice }
        );
        await tx.wait();

        const initialBalance = await shefNFT.availableToWithdraw(owner.address)
        expect(initialBalance).to.eq(300);

        const withdrawTx = await shefNFT.connect(owner).withdraw();
        await withdrawTx.wait();

        const finalBalance = await shefNFT.availableToWithdraw(owner.address)
        expect(finalBalance).to.eq(0);
    });
})