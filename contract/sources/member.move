module contract::member {
  use std::string::{String};
  use sui::url::{Url};

  public struct MemberNft has key {
    id: UID,
    name: String,
    description: String,
    sex: u8,
    avatar: Url,
  }

  // 会员专属nft
  public(package) fun create_member_nft (
    name: String,
    description: String,
    sex: u8,
    avatar: Url,
    ctx: &mut TxContext
  ) {
    let nft = MemberNft {
      id: object::new(ctx),
      name: name,
      description: description,
      sex: sex,
      avatar: avatar,
    };
    transfer::transfer(nft, tx_context::sender(ctx));
  }

  // 修改会员信息
  public fun change_info (
    nft: &mut MemberNft,
    name: String,
    description: String,
    sex: u8,
    avatar: Url,
  ) {
    nft.name = name;
    nft.description = description;
    nft.sex = sex;
    nft.avatar = avatar;
  }

  // 删除会员
  public entry fun delete_memeber_nft (
    nft: MemberNft,
    _: &mut TxContext 
  ) {
    let MemberNft {
      id,
      name: _,
      description: _,
      sex: _,
      avatar: _,
    } = nft;
    object::delete(id);
  }
}