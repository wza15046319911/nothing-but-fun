export default defineAppConfig({
  pages: [
    'pages/loading/index',
    'pages/carpool/index',
    'pages/carpool/publish/index',
    'pages/contact-info/index',
    'pages/past-activities/index',
    'pages/update-phone/index',
    'pages/index/index',
    'pages/course/write-review/index',
    'pages/second-hand/index',
    'pages/rental-house/index',
    'pages/restaurant/index',
    'pages/restaurant/detail/index',
    'pages/course/index',
    'pages/second-hand/publish/index',
    'pages/recent-activities/index',
    'pages/second-hand/detail/index',
    'pages/user-login/index',
    'pages/user-posts/index',
    'pages/gift/index',
    'pages/gift/detail/index',
    'pages/rental/index',
    'pages/rental/detail/index',
    'pages/rental-house/detail/index',
    'pages/restaurant/reviews/index',
    'pages/restaurant/write-review/index',
    'pages/course/reviews/index',
    'pages/user-registrations/index',
    'pages/car-rental/index',
    'pages/custom-tour/index',
    'pages/contact-us/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: "#666666",
    selectedColor: "#4a90e2",
    backgroundColor: "#ffffff",
    borderStyle: "black",
    list: [
      {
        pagePath: "pages/index/index",
        text: "首页",
        iconPath: "assets/icons/home.png",
        selectedIconPath: "assets/icons/home_click.png"
      },
      {
        pagePath: "pages/user-login/index",
        text: "我的",
        iconPath: "assets/icons/user.png",
        selectedIconPath: "assets/icons/user_click.png"
      }
    ]
  }
})
