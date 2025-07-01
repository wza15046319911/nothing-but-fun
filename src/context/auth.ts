import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { authApi, storageUtils, UserInfo } from "../services/auth";
import Taro from "@tarojs/taro";

// 认证状态类型
export interface AuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
  userInfo: UserInfo | null;
  openid: string | null;
  error: string | null;
}

// 认证操作类型
export type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "LOGIN_SUCCESS"; payload: { userInfo: UserInfo; openid: string } }
  | { type: "LOGIN_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "CLEAR_ERROR" }
  | { type: "UPDATE_USER_INFO"; payload: UserInfo };

// 初始状态
const initialState: AuthState = {
  isLoggedIn: false,
  isLoading: false,
  userInfo: null,
  openid: null,
  error: null,
};

// Reducer函数
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
        error: null,
      };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        isLoggedIn: true,
        isLoading: false,
        userInfo: action.payload.userInfo,
        openid: action.payload.openid,
        error: null,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        isLoggedIn: false,
        isLoading: false,
        userInfo: null,
        openid: null,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        isLoggedIn: false,
        isLoading: false,
        userInfo: null,
        openid: null,
        error: null,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    case "UPDATE_USER_INFO":
      return {
        ...state,
        userInfo: action.payload,
      };
    default:
      return state;
  }
};

// Context类型
interface AuthContextType {
  state: AuthState;
  checkLoginStatus: () => Promise<void>;
  createUser: (
    code: string,
    userInfo: { nickname: string; avatarUrl: string }
  ) => Promise<boolean>;
  logout: () => void;
  updateUserInfo: (userInfo: Partial<UserInfo>) => Promise<boolean>;
  clearError: () => void;
}

// 创建Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider组件属性
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider组件
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 检查登录状态
  const checkLoginStatus = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // 获取微信登录code
      const loginRes = await Taro.login();
      if (!loginRes.code) {
        throw new Error("获取微信登录code失败");
      }


      // 调用登录API获取openid
      const loginResponse = await authApi.wechatLogin({ code: loginRes.code });

      if (loginResponse.success && loginResponse.data.openid) {
        const openid = loginResponse.data.openid;
        console.log("获取到openid:", openid);

        // 根据openid获取用户信息
        try {
          const userInfoResponse = await authApi.getUserByOpenId(openid);

          if (userInfoResponse.success && userInfoResponse.data) {
            // 用户已存在，直接设置登录状态
            const userInfo = userInfoResponse.data;
            console.log("用户已存在，自动登录:", userInfo);

            // 保存到本地存储
            if (loginResponse.data.token) {
              storageUtils.saveUserData(loginResponse.data.token, userInfo);
            }

            dispatch({
              type: "LOGIN_SUCCESS",
              payload: { userInfo, openid },
            });
          } else {
            // 用户不存在，设置openid但不登录
            dispatch({ type: "SET_LOADING", payload: false });
            // 可以在这里设置openid以便后续创建用户
            console.log("用户不存在，需要创建用户");
          }
        } catch (userInfoError) {
          // 获取用户信息失败，说明用户不存在
          console.log("用户不存在，需要创建用户");
          dispatch({ type: "SET_LOADING", payload: false });
        }
      } else {
        throw new Error("获取openid失败");
      }
    } catch (error) {
      console.error("检查登录状态失败:", error);
      dispatch({
        type: "LOGIN_FAILURE",
        payload: error.message || "检查登录状态失败",
      });
    }
  };

  // 创建用户
  const createUser = async (
    code: string,
    userInfo: { nickname: string; avatarUrl: string }
  ): Promise<boolean> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // 首先获取openid
      const loginResponse = await authApi.wechatLogin({ code });

      if (!loginResponse.success || !loginResponse.data.openid) {
        throw new Error("获取用户openid失败");
      }

      const openid = loginResponse.data.openid;
      console.log("获取到openid:", openid);

      // 创建用户
      const createUserResponse = await authApi.createUser({
        openid: openid,
        nickname: userInfo.nickname,
        avatarUrl: userInfo.avatarUrl,
      });

      console.log("创建用户结果:", createUserResponse);

      if (createUserResponse.success && createUserResponse.data) {
        const newUserInfo: UserInfo = {
          id: createUserResponse.data.id,
          openid: createUserResponse.data.openid,
          nickname: createUserResponse.data.nickname,
          avatarUrl: createUserResponse.data.avatarUrl,
          city: createUserResponse.data.city || "",
          province: createUserResponse.data.province || "",
          gender: createUserResponse.data.gender || "",
          country: createUserResponse.data.country || "",
          language: createUserResponse.data.language || "Chinese",
        };

        // 保存用户信息到本地存储
        if (createUserResponse.token) {
          storageUtils.saveUserData(createUserResponse.token, newUserInfo);
        }

        dispatch({
          type: "LOGIN_SUCCESS",
          payload: { userInfo: newUserInfo, openid },
        });

        return true;
      } else {
        throw new Error(createUserResponse.message || "创建用户失败");
      }
    } catch (error) {
      console.error("创建用户失败:", error);
      dispatch({
        type: "LOGIN_FAILURE",
        payload: error.message || "创建用户失败",
      });
      return false;
    }
  };

  // 更新用户信息
  const updateUserInfo = async (
    userInfo: Partial<UserInfo>
  ): Promise<boolean> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const response = await authApi.updateProfile(userInfo);

      if (response.success && response.data) {
        // 更新本地存储
        const { token } = storageUtils.getUserData();
        if (token) {
          storageUtils.saveUserData(token, response.data);
        }

        dispatch({
          type: "UPDATE_USER_INFO",
          payload: response.data,
        });

        dispatch({ type: "SET_LOADING", payload: false });
        return true;
      } else {
        throw new Error(response.message || "更新用户信息失败");
      }
    } catch (error) {
      console.error("更新用户信息失败:", error);
      dispatch({
        type: "LOGIN_FAILURE",
        payload: error.message || "更新用户信息失败",
      });
      return false;
    }
  };

  // 退出登录
  const logout = () => {
    storageUtils.clearUserData();
    dispatch({ type: "LOGOUT" });
    console.log("用户已退出登录");
  };

  // 清除错误
  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  // 组件挂载时检查登录状态
  // useEffect(() => {
  //   checkLoginStatus();
  // }, []);

  const contextValue: AuthContextType = {
    state,
    checkLoginStatus,
    createUser,
    logout,
    updateUserInfo,
    clearError,
  };

  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  );
};

// 自定义Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// 导出Context（用于高级用法）
export { AuthContext };
