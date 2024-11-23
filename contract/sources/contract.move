// updatecap 0x514cfd7d469989286645eb4b97f9e11a9e9a7abe6574a6ba2496a3d70d8301a7
module contract::sui_hai {
  use sui::coin::{Self, value, Coin};
  use sui::sui::SUI;
  use sui::url::{Url};
  use std::string::{utf8, String};
  use sui::balance::{Self, zero, Balance};
  use sui::vec_set::{VecSet, empty};
  use contract::member::{create_member_nft, MemberNft};
  use contract::activity::{create_activity};

  // 当前会员已存在
  const ErrorAlreadyHasMember: u64 = 0;
  // 存的钱和数量不符
  const ErrorDepositNotEnough: u64 = 1;

 // 管理员权限
  public struct AdminCap has key {
    id: UID
  }

  // 系统结构体
  public struct SuiHaiServer has key {
    id: UID,
    name: String,
    pool_balance: Balance<SUI>, // 资金池
    members: VecSet<address>, // 平台成员
    activity_fee: u64, // 活动提现手续费， 总价 / 手续费 = 提现的费用
  }

  // 初始化，创建系统
  fun init (ctx: &mut TxContext) {
    let suiHaiServer = SuiHaiServer {
      id: object::new(ctx),
      name: utf8(b"SUI-HAI-SERVER"),
      pool_balance: zero(), // 资金池
      members: empty(),
      activity_fee: 1000
    };
    let admin_cap = AdminCap { id: object::new(ctx) };
    transfer::transfer(admin_cap, tx_context::sender(ctx));
    transfer::share_object(suiHaiServer);
  }

  // 管理员修改活动基础手续费
  public fun change_fee (
    _: &AdminCap,
    sui_hai_server: &mut SuiHaiServer,
    fee: u64
  ) {
    sui_hai_server.activity_fee = fee;
  }

  // 会员注册
  public fun add_memeber (
    sui_hai_server: &mut SuiHaiServer,
    name: String,
    description: String,
    sex: u8,
    avatar: Url,
    ctx: &mut TxContext
  ) {
    // 已经注册过的，不给再注册了
    if (sui_hai_server.members.contains(&ctx.sender())) {
      abort ErrorAlreadyHasMember
    };
    create_member_nft(
      name,
      description,
      sex,
      avatar,
      ctx
    );
    // 地址存入会员数组
    sui_hai_server.members.insert(ctx.sender());
  }

  // 创建活动
  public fun add_activity (
    _: &MemberNft,
    title: String, // 活动标题
    description: String, // 描述
    date_range: vector<String>, // 时间范围
    location: String, // 地点
    tag: String, // 分类
    total_people_num: u64, // 人数
    join_fee: u64,
    media: VecSet<String>, // 参与费用
    start_coin: Coin<SUI>, // 启动资金
    ctx: &mut TxContext
  ) {
    // 启动资金提取到余额
    let start_coin_balance = coin::into_balance(start_coin);
    // 创建活动
    create_activity(title,
      description,
      date_range,
      location,
      tag,
      total_people_num,
      join_fee,
      media,
      start_coin_balance,
      ctx
    );
  }

  // 服务器存钱
  public entry fun deposit(
    sui_hai_server: &mut SuiHaiServer,
    input: Coin<SUI>,
    amount: u64,
    ctx: &mut TxContext
  ) {
    let input_value = value(&input);
    assert!(input_value >= amount, ErrorDepositNotEnough);

    let mut input_balance = coin::into_balance(input);
    if (input_value > amount) {
        balance::join(
            &mut sui_hai_server.pool_balance,
            balance::split(&mut input_balance, amount)
        );
        let change = coin::from_balance(input_balance, ctx);
        transfer::public_transfer(change, tx_context::sender(ctx));
    } else {
        balance::join(&mut sui_hai_server.pool_balance, input_balance);
    }
  }

  // 服务器取钱
  public entry fun withdraw(
    _: &AdminCap,
    sui_hai_server: &mut SuiHaiServer,
    amount: u64,
    ctx: &mut TxContext
  ) {
      let output_balance = balance::split(&mut sui_hai_server.pool_balance, amount);
      let output = coin::from_balance(output_balance, ctx);
      transfer::public_transfer(output, tx_context::sender(ctx));
  }
}
