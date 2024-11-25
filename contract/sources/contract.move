// updatecap 0x514cfd7d469989286645eb4b97f9e11a9e9a7abe6574a6ba2496a3d70d8301a7
module contract::sui_hai {
  use sui::coin::{Self, value, Coin};
  use sui::sui::SUI;
  use sui::url::{Url};
  use std::string::{utf8, String};
  use sui::balance::{Self, zero, Balance};
  use sui::vec_set::{VecSet, empty};
  use sui::table::{Self, Table};
  use sui::package::{claim_and_keep}
  use contract::member::{create_member_nft, MemberNft};
  use contract::activity::{Activity, create_activity};

  // 存的钱和数量不符
  const ErrorDepositNotEnough: u64 = 0;

  public struct SUIHAI has drop {}

 // 管理员权限
  public struct AdminCap has key {
    id: UID
  }

  // 系统结构体
  public struct SuiHaiServer has key {
    id: UID,
    name: String,
    pool_balance: Balance<SUI>, // 资金池
    activity_fee: u64, // 活动提现手续费， 总价 / 手续费 = 提现的费用
    activity_cash_pledge: Table<Activity, Coin<SUI>> // 活动押金
    activity_max_join_fee: u64 // 活动收费最高限制
  }

  // 初始化，创建系统
  fun init (witness: SHIHAI, ctx: &mut TxContext) {
    let suiHaiServer = SuiHaiServer {
      id: object::new(ctx),
      name: utf8(b"SUI-HAI-SERVER"),
      pool_balance: zero(), // 资金池
      activity_fee: 10000, // 万一手续费
      activity_cash_pledge: table::new<Activity, Coin<SUI>>(ctx),
      activity_max_join_fee: 100_000_000_000
    };
    claim_and_keep(SHIHAI, tx_context::sender(ctx));
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
