module contract::member {
  use std::string::{String, utf8};
  use sui::url::{Url, new_unsafe};

  // 会员信息结构体
  public struct Member has store, copy {
    nickname: String,
    description: String,
    sex: String,
    avatar: String,
    index: u64,
  }

  // 会员nft结构体
  public struct MemberNft has key {
    id: UID,
    name: String,
    nickname: String,
    description: String,
    sex: String,
    avatar: String,
    url: Url,
    index: u64,
  }

  public(package) fun get_member_struct (
    nickname: String,
    description: String,
    sex: String,
    avatar: String,
    index: u64,
  ): Member {
    Member {
      nickname,
      description,
      sex,
      avatar,
      index,
    }
  }

  // 会员专属nft
  public(package) fun create_member_nft (
    nickname: String,
    description: String,
    sex: String,
    avatar: String,
    index: u64,
    ctx: &mut TxContext
  ) {
    let mut name = utf8(b"SUI-HAI-MEMBER");
    name.append(nickname);
    name.append(utf8(b"#"));
    name.append(index.to_string());

    let nft = MemberNft {
      id: object::new(ctx),
      name,
      nickname: nickname,
      description: description,
      sex: sex,
      avatar: avatar,
      url: new_unsafe(avatar.to_ascii()),
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
    _: &mut TxContext
  ) {
    nft.name = name;
    nft.description = description;
    nft.sex = sex;
    nft.avatar = avatar;
    nft.index = index;
  }

  // 删除会员
  public entry fun delete_memeber_nft (
    nft: MemberNft,
    _: &mut TxContext 
  ) {
    let MemberNft {
      id,
      name: _,
      nickname: _,
      description: _,
      sex: _,
      avatar: _,
      url: _,
      index: _,
    } = nft;
    object::delete(id);
  }
}