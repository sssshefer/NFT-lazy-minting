// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IERC721Lazy.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

abstract contract ERC721Lazy is ERC721URIStorage, EIP712, IERC721Lazy {
    mapping(address => uint) public sellerBalances;

    bytes32 private constant _VOUNCHER_TYPEHASH =
        keccak256("NFTVoucher(uint256 tokenId, uint256 minPrice, string uri)");

    constructor(string memory name) EIP712(name, "1") {}

    function redeem(
        address owner,
        address redeemer,
        uint tokenId,
        uint minPrice,
        string memory uri,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public payable returns (uint) {
        require(msg.value >= minPrice);

        bytes32 structHash = keccak256(
            abi.encode(
                _VOUNCHER_TYPEHASH,
                tokenId,
                minPrice,
                keccak256(bytes(uri))
            )
        );

        bytes32 digest = _hashTypedDataV4(structHash);

        address signer = ECDSA.recover(digest, v, r, s);

        require(signer == owner);

        _mint(signer, tokenId);
        _setTokenURI(tokenId, uri);
        _transfer(signer, redeemer, tokenId);

        sellerBalances[signer] += msg.value;

        return tokenId;
    }
}
