pragma solidity ^0.4.23;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721.sol';
import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Metadata.sol';

contract StarNotary is ERC721, ERC721Metadata {
    struct Star {
        string name;
    }

    constructor () ERC721Metadata("StarNotary", "SN") public { }

    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(uint256 => uint256) public starsForSale;

    function createStar(string _name, uint256 _tokenId) public {
        Star memory newStar = Star(_name);

        tokenIdToStarInfo[_tokenId] = newStar;

        _mint(msg.sender, _tokenId);
    }

    function lookUptokenIdToStarInfo(uint256 _tokenId) public view returns (string name) {
        name = tokenIdToStarInfo[_tokenId].name;
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender);

        starsForSale[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public payable {
        require(starsForSale[_tokenId] > 0);

        uint256 starCost = starsForSale[_tokenId];
        address starOwner = ownerOf(_tokenId);
        require(msg.value >= starCost);

        _removeTokenFrom(starOwner, _tokenId);
        _addTokenTo(msg.sender, _tokenId);

        starOwner.transfer(starCost);

        if (msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost);
        }
        starsForSale[_tokenId] = 0;
    }

    // Add a function called exchangeStars, so 2 users can exchange their star tokens...
    // Do not worry about the price, just write code to exchange stars between users.
    function exchangeStars(uint256 _tokenIdA, uint256 _tokenIdB) public {
      address ownerA = ownerOf(_tokenIdA);
      address ownerB = ownerOf(_tokenIdB);

      _removeTokenFrom(ownerA, _tokenIdA);
      _addTokenTo(ownerB, _tokenIdA);

      _removeTokenFrom(ownerB, _tokenIdB);
      _addTokenTo(ownerA, _tokenIdB);

      emit Transfer(ownerA, ownerB, _tokenIdA);
      emit Transfer(ownerB, ownerA, _tokenIdB);
    }

    // Write a function to Transfer a Star. The function should transfer a star from the address of the caller.
    // The function should accept 2 arguments, the address to transfer the star to, and the token ID of the star.
    function transferStar(uint256 _tokenId, address _to) public {
      transferFrom(msg.sender, _to, _tokenId);
    }
}
