module contract::member {
  use std::string::{String};
  use sui::url::{Url, new_unsafe_from_bytes};

  // 当前会员不匹配
  const ErrorMemberNotMatch: u64 = 0;

  // 会员信息结构体
  public struct Member has store, copy {
    name: String,
    description: String,
    sex: String,
    avatar: String,
    index: u64,
  }

  // 会员nft结构体
  public struct MemberNft has key {
    id: UID,
    name: String,
    description: String,
    sex: String,
    avatar: String,
    url: Url,
    index: u64,
  }

  public(package) fun get_member_struct (
    name: String,
    description: String,
    sex: String,
    avatar: String,
    index: u64,
  ): Member {
    Member {
      name,
      description,
      sex,
      avatar,
      index,
    }
  }

  // 会员专属nft
  public(package) fun create_member_nft (
    name: String,
    description: String,
    sex: String,
    avatar: String,
    index: u64,
    ctx: &mut TxContext
  ) {
    let nft = MemberNft {
      id: object::new(ctx),
      name: name,
      description: description,
      sex: sex,
      avatar: avatar,
      url: new_unsafe_from_bytes(b"https://aggregator.walrus-testnet.walrus.space/v1/iLHp_40XlzSXUfdVaT8hTRH__x_YAvggBzHeuB7hR1U"),
      index: index,
    };
    transfer::transfer(nft, tx_context::sender(ctx));
  }

  // 修改会员信息
  public fun change_info (
    nft: &mut MemberNft,
    name: String,
    description: String,
    sex: String,
    avatar: String,
    index: u64,
    ctx: &mut TxContext
  ) {
    assert!(tx_context::sender(ctx) == object::uid_to_address(&nft.id), ErrorMemberNotMatch); 
    nft.name = name;
    nft.description = description;
    nft.sex = sex;
    nft.avatar = avatar;
    nft.index = index;
  }

  // 删除会员
  public entry fun delete_memeber_nft (
    nft: MemberNft,
    ctx: &mut TxContext 
  ) {
    assert!(tx_context::sender(ctx) == object::uid_to_address(&nft.id), ErrorMemberNotMatch);
    let MemberNft {
      id,
      name: _,
      description: _,
      sex: _,
      avatar: _,
      url: _,
      index: _,
    } = nft;
    object::delete(id);
  }
}