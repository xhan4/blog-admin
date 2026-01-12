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
}