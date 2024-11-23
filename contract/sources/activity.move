module contract::activity {
  use std::string::String;
  use sui::vec_set::{empty, VecSet};
  use sui::balance::{Balance};
  use sui::sui::SUI;

  public struct AdminCap has key {
    id: UID
  }

  // 活动结构
  public struct Activity has key, store {
    id: UID,
    title: String, // 活动标题
    description: String, // 描述
    date_range: vector<String>, // 时间范围
    location: String, // 地点
    tag: String, // 分类
    total_people_num: u64, // 人数
    join_fee: u64, // 参与费用
    join_memeber: VecSet<address>, // 参加的成员列表
    media: VecSet<String>, // 媒体文件 图片
    total_price: Balance<SUI>, // 总活动资金
  }

  // 创建活动
  public(package) fun create_activity (
    title: String, // 活动标题
    description: String, // 描述
    date_range: vector<String>, // 时间范围
    location: String, // 地点
    tag: String, // 分类
    total_people_num: u64, // 人数
    join_fee: u64,  // 参与费用
    media: VecSet<String>, // 图片
    total_price: Balance<SUI>, // 总活动资金
    ctx: &mut TxContext
  ) {
    let activity = Activity {
      id: object::new(ctx),
      title,
      description,
      date_range,
      location,
      tag,
      total_people_num,
      join_fee,
      join_memeber: empty(),
      media,
      total_price,
    };
    let admin_cap = AdminCap { id: object::new(ctx) };
    transfer::transfer(admin_cap, tx_context::sender(ctx));
    transfer::public_share_object(activity);
  }

  // 更新活动信息
  public fun update_activity (
    _: &AdminCap,
    activity: &mut Activity,
    title: String,
    description: String,
    date_range: vector<String>,
    location: String,
    tag: String,
    total_people_num: u64,
    join_fee: u64,
    media: VecSet<String>,
  ) {
    activity.title = title;
    activity.description = description;
    activity.date_range = date_range;
    activity.location = location;
    activity.tag = tag;
    activity.total_people_num = total_people_num;
    activity.join_fee = join_fee;
    activity.media = media;
  }
}
