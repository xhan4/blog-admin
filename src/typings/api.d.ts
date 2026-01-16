/**
 * Namespace Api
 *
 * All backend api type
 */
declare namespace Api {
  namespace Common {
    /** common params of paginating */
    interface PaginatingCommonParams {
      /** current page number */
      current: number;
      /** page size */
      size: number;
      /** total count */
      total: number;
    }

    /** common params of paginating query list data */
    interface PaginatingQueryRecord<T = any> extends PaginatingCommonParams {
      records: T[];
    }

    /** common search params of table */
    type CommonSearchParams = Pick<Common.PaginatingCommonParams, 'current' | 'size'>;

    /**
     * enable status
     *
     * - "1": enabled
     * - "2": disabled
     */
    type EnableStatus = '1' | '2';

    /** common record */
    type CommonRecord<T = any> = {
      /** record id */
      id: number;
      /** record creator */
      createBy: string;
      /** record create time */
      createTime: string;
      /** record updater */
      updateBy: string;
      /** record update time */
      updateTime: string;
      /** record status */
      status: EnableStatus | null;
    } & T;
  }

  /**
   * namespace Auth
   *
   * backend api module: "auth"
   */
  namespace Auth {
    interface LoginToken {
      token: string;
      refreshToken: string;
    }

    interface UserInfo {
      userId: string;
      nickname: string;
      roles: string[];
      buttons: string[];
    }

    type RoleType = '0' | '1' | '2';
    // 根据实际API数据，membership是字符串数字类型
    type MembershipType = '0' | '1' | '2' | '3';
  }

  /**
   * namespace Route
   *
   * backend api module: "route"
   */
  namespace Route {
    type ElegantConstRoute = import('@elegant-router/types').ElegantConstRoute;

    interface MenuRoute extends ElegantConstRoute {
      id: string;
    }

    interface UserRoute {
      routes: MenuRoute[];
      home: import('@elegant-router/types').LastLevelRouteKey;
    }
  }

  namespace User {
    interface UserInfo {
      id: number;
      appId?: string; // 可选字段
      username: string;
      password?: string; // 可选字段
      avatar: string | null;
      roles: string[];
      nickname: string;
      active: number | null; // 允许null
      salt?: string; // 可选字段
      points: number;
      membership: string; // 根据实际API数据，使用字符串类型
      create_time: string;
      update_time: string;
    }

    interface UserListParams {
      page?: number;
      pageSize?: number;
      username?: string;
      nickname?: string;
      active?: number;
      membership?: string; // 更新为字符串类型
    }

    // 更新UserListResult以匹配实际API响应格式
    interface UserListResult {
      data: UserInfo[];  // 数据在data字段中
      code: number;
      msg: string;
    }

    // 用户详情响应格式
    interface UserDetailResult {
      data: UserInfo;     // 数据在data字段中
      code: number;
      msg: string;
    }
  }
  namespace Points {
    // 积分交易类型枚举
    type TransactionType = 'register_bonus' | 'video_deduction' | 'video_refund' | 'daily_check' | 'share_bonus' | 'manual_add' | 'manual_deduct';
    
    // 积分记录项
    interface PointsRecord {
      createdAt(createdAt: any): import("vue").VNodeChild;
      id: number;
      userId: number;
      username: string;
      points: number; // 变动积分值，正数为增加，负数为减少
      balance: number; // 变动后的积分余额
      transactionType: TransactionType;
      description: string;
      createTime: string;
      operatorId?: number; // 操作员ID，如果是管理员操作
    }
    
    // 获取积分历史记录的参数
    interface PointsHistoryParams {
      page?: number;
      limit?: number;
      username?: string;
      transactionType?: TransactionType;
      startDate?: string;
      endDate?: string;
    }
    
    // 积分历史记录数据
    interface PointsHistoryData {
      records: PointsRecord[];
      total: number;
      page: number;
      limit: number;
    }
    
    // 调整用户积分的参数
    interface AdjustPointsParams {
      userId: number;
      points: number; // 正数为增加，负数为减少
      description: string;
    }
    
    // 调整积分数据
    interface AdjustPointsData {
      userId: number;
      oldBalance: number;
      newBalance: number;
      adjustedPoints: number;
    }
    
    // 用户积分数据
    interface UserPointsData {
      userId: number;
      balance: number;
    }
  }
}

