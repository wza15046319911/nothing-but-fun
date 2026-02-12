export default defineAppConfig({
  pages: [
    'pages/loading/index',
    'pages/index/index',
    'pages/user-login/index',
    'pages/profile/index',
  ],
  subPackages: [
    {
      root: 'pages/second-hand',
      pages: ['index', 'detail/index', 'publish/index'],
    },
    {
      root: 'pages/course',
      pages: ['index', 'reviews/index', 'write-review/index'],
    },
    {
      root: 'pages/restaurant',
      pages: ['index', 'detail/index'],
    },
    {
      root: 'pages/gift',
      pages: ['index', 'detail/index'],
    },
    {
      root: 'pages/rental',
      pages: ['index', 'detail/index'],
    },
    {
      root: 'pages/events',
      pages: ['detail/index'],
    },
    {
      root: 'pages/user-posts',
      pages: ['index'],
    },
    {
      root: 'pages/user-registrations',
      pages: ['index'],
    },
    {
      root: 'pages/recent-activities',
      pages: ['index'],
    },
    {
      root: 'pages/past-activities',
      pages: ['index'],
    },
    {
      root: 'pages/contact-info',
      pages: ['index'],
    },
    {
      root: 'pages/contact-us',
      pages: ['index'],
    },
    {
      root: 'pages/update-phone',
      pages: ['index'],
    },
  ],
  lazyCodeLoading: 'requiredComponents',
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    color: '#666666',
    selectedColor: '#4a90e2',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/icons/home.png',
        selectedIconPath: 'assets/icons/home_click.png',
      },
      {
        pagePath: 'pages/user-login/index',
        text: '我的',
        iconPath: 'assets/icons/user.png',
        selectedIconPath: 'assets/icons/user_click.png',
      },
    ],
  },
});
