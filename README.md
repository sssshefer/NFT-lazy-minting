<img src="https://github.com/user-attachments/assets/3b56de17-cc65-41f7-b4a4-7563f0449ba6" alt="lazy-person-at-the-table"/>

# NFT Lazy Minting
This project showcases how to implement "lazy minting" of NFTs using off-chain signatures. The term "lazy" in this context means that NFTs are not minted until they are purchased. This is accomplished by using off-chain signatures (vouchers), which can be redeemed by a buyer to mint the NFT on-chain. The project makes use of several OpenZeppelin dependencies, including `ERC721`, `ECDSA`, and `EIP712`. This project is intended for educational purposes and does not guarantee 100% security on a real blockchain.

## Table of Contents
- [Introduction](#nft-lazy-minting)
- [Theory Notes](#theory-notes)
  - [What does "lazy" mean here?](#what-does-lazy-mean-here)
  - [What is a Voucher?](#what-is-a-voucher)
  - [EIP712 and ECDSA](#eip712-and-ecdsa)
- [Features and Functionality](#features-and-functionality)
- [Implementation](#implementation)
  - [Contract Overview](#contract-overview)
  - [Tests](#tests)
- [Running the Project Locally](#running-the-project-locally)

## Theory Notes

### What does "lazy" mean here?
In the context of NFTs, "lazy minting" refers to a process where NFTs are not minted (i.e., created on the blockchain) until they are purchased. This approach minimizes gas fees for creators by deferring the minting process until absolutely necessary, thereby reducing the upfront cost of creating NFTs.

### What is a Voucher?
A voucher is a signed message from the NFT creator that contains all the necessary information to mint a specific NFT. This message can be sent off-chain and redeemed by a buyer on-chain. The voucher includes details like the token ID, minimum price, metadata URI in this project. But it can contain any information. Only the holder of the voucher can redeem and mint the NFT on the blockchain, and this can only be done once.

### EIP712 and ECDSA
EIP712 is a standard for hashing and signing typed structured data in Ethereum. It is used to ensure the integrity and security of the off-chain signatures. ECDSA (Elliptic Curve Digital Signature Algorithm) is the cryptographic algorithm used to generate and verify these signatures. Together, EIP712 and ECDSA enable secure and verifiable off-chain signatures that can be used to authorize on-chain transactions.

## Features and Functionality
- **Lazy Minting**: NFTs are only minted upon purchase, reducing initial costs for creators.
- **Voucher System**: Off-chain vouchers allow secure and flexible distribution of NFTs.
- **Security**: The project implements signature verification using EIP712 and ECDSA, ensuring that only authorized users can mint the NFTs.

## Implementation

### Contract Overview
The core contract `ERC721Lazy` inherits from OpenZeppelin's `ERC721URIStorage`, `EIP712`, and implements a custom interface `IERC721Lazy`. It uses the `redeem` function to mint an NFT when a valid voucher is presented, and the `withdraw` function allows creators to claim their earnings.

### Tests
The project includes a set of tests written in TypeScript that cover various scenarios, including successful NFT redemption, handling insufficient funds, preventing double redemption, and ensuring only valid signatures are accepted.

## Running the Project Locally

To run this project locally, follow these steps:

1. **Clone the Repository**:
    ```bash
    git clone https://github.com/sssshefer/NFT-lazy-minting.git
    cd NFT-lazy-minting
    ```

2. **Install Dependencies**:
    ```bash
    npm install
    ```

3. **Compile Contracts**:
    ```bash
    npx hardhat compile
    ```

4. **Run Tests**:
    ```bash
    npx hardhat test
    ```
<hr/>
<a href="https://ru.freepik.com/free-vector/postponed-concept-with-man-relaxing_7436429.htm#fromView=search&page=1&position=8&uuid=1367c0a1-8157-472c-a6b8-75cff3348042">Head Picture is from freepik</a>

***Happy hacking***
