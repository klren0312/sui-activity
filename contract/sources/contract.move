// updatecap 0x514cfd7d469989286645eb4b97f9e11a9e9a7abe6574a6ba2496a3d70d8301a7
module contract::sui_activity {
  use sui::bag::{Self, Bag};
  use sui::table::{Self, Table, contains, borrow_mut, add, remove};
  use sui::coin::{value, Coin, join, split};
  use sui::dynamic_object_field as ofield;
  use sui::url::{Url, new_unsafe_from_bytes};
  use std::string::{utf8, String};

  // 不是物品所有人报错
  const ErrorNotOwner: u64 = 1;

  // 支付价格不够
  const ErrorAmountNotEnough: u64 = 2;

  public struct MarketNft has key {
    id: UID,
    name: String,
    description: String,
    url: Url,
    market_amount: u64,
  }

  // 任何人都能创建的交易市场，
  // 每个市场只能接受一种类型的币
  public struct Marketplace<phantom COIN> has key {
    id: UID,
    items: Bag,
    payments: Table<address, Coin<COIN>>
  }

  // 放在市场上的物品结构
  public struct Listing has key, store {
    id: UID,
    sell_price_amount: u64,
    owner: address,
  }

  // 创建一个共享的市场对象
  // 传入币的类型
  // https://suiscan.xyz/testnet/tx/CjePrxVHMNgro7i32eACzSEi8NL5sLS83iqM7zBm1x36
  // marketspace objectid 0xa4b4ea307352889b691ae5f6f33b7c73efd3219ab6f55aeb5fcf85babdba42f5
  public entry fun create_market<T>(name: String, ctx: &mut TxContext) {
    let id = object::new(ctx);
    let items = bag::new(ctx);
    let payments = table::new<address, Coin<T>>(ctx);
    // 发送商店nft
    let marketNft = MarketNft {
      id: object::new(ctx),
      name: name,
      description: utf8(b"商店凭证"),
      url: new_unsafe_from_bytes(b"https://aggregator.walrus-testnet.walrus.space/v1/_4ApAD7Xujmz6YxCKIdvYf-mXa0x050LqV93qTm4Q20"),
      market_amount: 1,
    };
    transfer::share_object(Marketplace<T> {
      id,
      items,
      payments
    });
    transfer::transfer(marketNft, tx_context::sender(ctx));
  }

  // 将物品添加到市场的列表中
  // 被卖物品的type，币的type，市场对象id，被卖物品id，售价
  // https://suiscan.xyz/testnet/tx/3mJQstW9KhTZccHckWUuxYN79MWyktjParzVhKwGCkee
  public entry fun list<T: key + store, K>(
    marketplace: &mut Marketplace<K>,
    item: T,
    sell_price_amount: u64,
    ctx: &mut TxContext
  ) {
    // 获取item对象的id
    let item_id = object::id(&item);
    let mut listing = Listing {
      id: object::new(ctx),
      sell_price_amount,
      owner: tx_context::sender(ctx),
    };
    // 新增动态对象区域
    ofield::add(&mut listing.id, true, item);
    bag::add(&mut marketplace.items, item_id, listing)
  }

  // 把物品从列表中移除，并返回物品；只能所有者进行这个操作
  fun delist<T: key + store,  K>(
    marketplace: &mut Marketplace<K>,
    item_id: ID,
    ctx: &TxContext
  ): T {
    // 从bag中取出当前物品，并结构
    let Listing {
      mut id,
      owner,
      sell_price_amount: _,
    } = bag::remove(&mut marketplace.items, item_id);
    // 判断操作交易的是否是物品所有人
    assert!(tx_context::sender(ctx) == owner, ErrorNotOwner);

    let item = ofield::remove(&mut id, true);
    object::delete(id);
    item
  }

  // 列表移除物品，并发送给所有人
  // 物品类型，币类型，市场objectid，物品id
  // https://suiscan.xyz/testnet/tx/38qQCT9LsoNH98eJcQJdK6R9aK5S1WZPbiNpoMyii7ro
  public entry fun delist_and_take<T: key + store, K>(
    marketplace: &mut Marketplace<K>,
    item_id: ID,
    ctx: &mut TxContext
  ) {
    // 从列表中移除物品
    let item = delist<T, K>(marketplace, item_id, ctx);
    // 发送物品到所有人
    transfer::public_transfer(item, tx_context::sender(ctx));
  }

  // 购买物品，记录交易
  fun buy<T: key + store, K>(
    marketplace: &mut Marketplace<K>,
    item_id: ID,
    paid: &mut Coin<K>,
    ctx: &mut TxContext
  ): T {

    let Listing {
      mut id,
      sell_price_amount,
      owner,
    } = bag::remove(&mut marketplace.items, item_id);

    assert!(sell_price_amount < value(paid), ErrorAmountNotEnough);

    let split_coin = split(paid, sell_price_amount, ctx);
    // 检查交易记录中是否有跟当前地址关联的记录，有就合并
    // 没有就新增
    if (contains<address, Coin<K>>(&marketplace.payments, owner)) {
      join(
        borrow_mut<address, Coin<K>>(&mut marketplace.payments, owner),
        split_coin
      )
    } else {
      add(&mut marketplace.payments, owner, split_coin)
    };

    let item = ofield::remove(&mut id, true);
    object::delete(id);
    item
  }

  // 购买物品并转发物品给当前地址
  public entry fun buy_and_take<T: key + store, K>(
    marketplace: &mut Marketplace<K>,
    item_id: ID,
    paid: &mut Coin<K>,
    ctx: &mut TxContext
  ) {
    transfer::public_transfer(
      buy<T, K>(marketplace, item_id, paid, ctx),
      tx_context::sender(ctx)
    )
  }

  // 收取收益，从交易记录中获取coin
  fun take_profits<COIN>(
    marketplace: &mut Marketplace<COIN>,
    ctx: &TxContext
  ): Coin<COIN> {
    remove<address, Coin<COIN>>(&mut marketplace.payments, tx_context::sender(ctx))
  }

  // 收取收益，并发送给请求者
  public entry fun take_profits_and_keep<COIN>(
    marketplace: &mut Marketplace<COIN>,
    ctx: &mut TxContext
  ) {
    transfer::public_transfer(
      take_profits(marketplace, ctx),
      tx_context::sender(ctx)
    )
  }
}
