pragma solidity ^0.5.0;


contract TSquareToken {

    uint256 public totalSupply;
    string public name = 'AsixoCoin';
    string public symbol = "Asixo";
    string public standard = "Asixo token version 1.0";

    mapping(address => uint) public balanceOf;
    mapping(address => mapping(address => uint)) public allowance;
    event Transfer (
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    event Approval (
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );
    constructor (uint256 _initialSupply) public {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value);

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);

        return true;
    }

    function approve(address _spender, uint256 _amount) public returns (bool success) {
        allowance[msg.sender][_spender] = _amount;

        emit Approval(msg.sender, _spender, _amount);

        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);
        
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        allowance[_from][msg.sender] -= _value;

        emit Transfer(_from, _to, _value);

        return true;
    }
}