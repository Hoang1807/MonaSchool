window.onscroll = function () {
  if (document.documentElement.scrollTop > 75) {
    document
      .getElementsByClassName("row")[0]
      .setAttribute("class", "row sticky-top smooth-nav-down");
  } else {
    document.getElementsByClassName("row")[0].setAttribute("class", "row");
  }
};
var app = angular.module("myApp", ["ngRoute"]);
app.config(function ($routeProvider) {
  $routeProvider
    .when("/trangchu", {
      title: "Trang chủ",
      templateUrl: "trangchu.html?" + Math.random(),
      controller: "trangchuCtrl",
    })
    .when("/gioithieu", {
      title: "Giới thiệu",
      templateUrl: "gioithieu.html?" + Math.random(),
    })
    .when("/monhoc", {
      title: "Môn học",
      templateUrl: "monhoc.html?" + Math.random(),
      controller: "monhocCtrl",
    })
    .when("/lienhe", {
      title: "Liên hệ",
      templateUrl: "lienhe.html?" + Math.random(),
    })
    .when("/taikhoan/doimatkhau", {
      title: "Đổi mật khẩu",
      templateUrl: "doimatkhau.html?" + Math.random(),
      controller: "doimatkhauCtrl",
    })
    .when("/taikhoan/trangcanhan", {
      title: "Trang cá nhân",
      templateUrl: "trangcanhan.html?" + Math.random(),
      controller: "trangcanhanCtrl",
    })
    .when("/quiz/:id/:tenMH", {
      title: "Bài kiểm tra",
      templateUrl: "quiz.html?" + Math.random(),
      controller: "quizCtrl",
    })
    .otherwise({ redirectTo: "/trangchu" });
});

app.run(function ($rootScope) {
  $rootScope.title = sessionStorage.getItem("title");
  // sự kiện thay đổi router
  $rootScope.$on("$routeChangeStart", function (event, next, current) {
    try {
      $rootScope.title = next.$$route.title;
    } catch (error) {}

    // nếu page hướng đến có title là Bài kiểm tra thì set title tên tên môn học
    try {
      if (next.$$route.title === "Bài kiểm tra") {
        $rootScope.title = "Bài Kiểm Tra | " + next.params.tenMH;
        if (sessionStorage.getItem("idMH") == null) {
          sessionStorage.setItem("idMH", JSON.stringify(next.params));
        }
      }
    } catch (error) {}

    // nếu page hiện tại có title là bài kiểm tra thì đặt ra confirm
    sessionStorage.setItem("title", $rootScope.title);
  });
});

app.controller(
  "myctrl",
  function ($scope, $http, $rootScope, $location, $filter) {
    $rootScope.flag;
    $rootScope.listAccount = JSON.parse(sessionStorage.getItem("listAccount"));
    $rootScope.accountActive = JSON.parse(sessionStorage.getItem("account"));
    $scope.register = {
      gender: "nam",
    };
    if ($rootScope.accountActive == null) {
      $rootScope.accountActive = [];
    }
    if ($rootScope.listAccount == null) {
      $http({
        method: "GET",
        url: "JS/account.js",
      }).then(
        function (response) {
          $rootScope.listAccount = response.data;
        },
        function (response) {
          alert("Lỗi rồi");
        }
      );
    }

    // thay đổi icon và show password
    $scope.changeIcon = function () {
      let value = document.getElementById("pass");
      let iconPass = document.getElementById("iconPass");
      if (value.type == "password") {
        value.type = "text";
        iconPass.setAttribute("class", "bi bi-eye");
      } else {
        value.type = "password";
        iconPass.setAttribute("class", "bi bi-eye-slash");
      }
    };

    // đăng nhập
    $scope.dangnhap = function () {
      let flag = true;
      for (let i = 0; i < $rootScope.listAccount.length; i++) {
        if (
          $rootScope.listAccount[i].userName === $scope.login.taikhoan &&
          $rootScope.listAccount[i].passWord === $scope.login.matkhau
        ) {
          $rootScope.accountActive = angular.copy($rootScope.listAccount[i]);
          flag = false;
          break;
        }
      }
      if (flag) {
        alert("Tài Khoản Không Tồn Tại");
      } else {
        sessionStorage.setItem(
          "account",
          JSON.stringify($rootScope.accountActive)
        );
        document.getElementById("btn-close-login").click();
        $location.path("/trangchu");
      }
    };

    // đăng xuất
    $scope.dangxuat = function () {
      sessionStorage.removeItem("account");
      $rootScope.accountActive = [];
      $scope.login = {
        taikhoan: "",
        matkhau: "",
      };
      alert("Đăng xuất thành công");
      $location.path("/trangchu");
    };

    // đăng ký
    $scope.dangky = function () {
      if ($scope.formRegister.$valid) {
        let account = {
          id: $rootScope.listAccount.length,
          name: $scope.register.name,
          img: "Image/img_default.png",
          userName: $scope.register.username,
          passWord: $scope.register.password,
          gender: $scope.register.gender == "nam" ? true : false,
          email: $scope.register.email,
          birthday: $filter("date")($scope.register.date, "yyyy-MM-dd"),
        };

        $rootScope.listAccount.push(account);
        sessionStorage.setItem(
          "listAccount",
          JSON.stringify($rootScope.listAccount)
        );
        document.getElementById("model-login").click();

        // lựa chọn nếu true tự động điền form đăng nhập với tài khoản vừa tạo và ngược lại ...
        let select = confirm("Đăng nhập với tài khoản vừa tạo?");
        if (select) {
          $scope.login = {
            taikhoan: $scope.register.username,
            matkhau: $scope.register.password,
          };
        } else {
          $scope.login = {
            taikhoan: "",
            matkhau: "",
          };
        }

        // format form dangky
        $scope.register = {
          name: "",
          userName: "",
          passWord: "",
          gender: "nam",
          email: "",
          birthday: "",
        };
        $location.path("/trangchu");
      }
    };
    $scope.del = function () {
      document.getElementById("btn-close-offcanvas").click();
    };
  }
);

app.controller(
  "trangcanhanCtrl",
  function ($scope, $rootScope, $route, $filter, $timeout) {
    $scope.historyQuiz = JSON.parse(sessionStorage.getItem("historyQuiz"));
    if ($scope.historyQuiz == null) {
      $scope.historyQuiz == [];
    }
    $scope.account = angular.copy(
      $rootScope.listAccount[$rootScope.accountActive.id]
    );

    if ($scope.account.img == "Image/img_default.png") {
      $scope.account.img = "";
    }
    if ($rootScope.accountActive.img == "") {
      $rootScope.accountActive.img = "Image/img_default.png";
    }

    //định dạng lại ngày sinh để ráng vào inp có kiểu date
    $scope.account.birthday = new Date($scope.account.birthday);

    $scope.capnhat = function () {
      if ($scope.formProfile.$valid) {
        $scope.account.gender = $scope.account.gender == "nam" ? true : false;
        $scope.account.birthday = $filter("date")(
          $scope.account.birthday,
          "yyyy-MM-dd"
        );
        $rootScope.listAccount[$rootScope.accountActive.id] = angular.copy(
          $scope.account
        );
        $rootScope.accountActive = angular.copy($scope.account);
        sessionStorage.setItem(
          "listAccount",
          JSON.stringify($rootScope.listAccount)
        );
        sessionStorage.setItem(
          "account",
          JSON.stringify($rootScope.accountActive)
        );
        document.getElementById("btn-close-profile").click();
        $route.reload();
      }
    };
    $scope.cancel = function () {
      $timeout(function () {
        $scope.account = angular.copy(
          $rootScope.listAccount[$rootScope.accountActive.id]
        );
      }, 500);
    };
  }
);

app.controller("trangchuCtrl", function ($scope, $http, $rootScope) {
  $scope.listMonHocNoiBat = [];
  $http({
    method: "GET",
    url: "JS/monhocnoibat.js",
  }).then(
    function (response) {
      $scope.listMonHocNoiBat = response.data;
    },
    function (response) {
      alert("Lỗi rồi");
    }
  );
});

app.controller("ctrlNav", function ($scope, $http, $location) {
  $scope.listNav = [];
  $http({
    method: "GET",
    url: "JS/nav.js",
  }).then(
    function (response) {
      $scope.listNav = response.data;
    },
    function (response) {
      alert("Lỗi rồi");
    }
  );
});

app.controller("monhocCtrl", function ($scope, $http, $rootScope) {
  $scope.checkAccount = $rootScope.accountActive != "" ? true : false;
  $scope.idMHActive = JSON.parse(sessionStorage.getItem("idMH"));
  if ($scope.idMHActive == null) {
    $scope.idMHActive = "";
  }
  $scope.errorSignin = function () {
    alert("Vui lòng đăng nhập");
  };
  $scope.errorSignMH = function (idMH) {
    if ($scope.idMHActive != "" && $scope.idMHActive.id != idMH) {
      alert(
        "Hãy hoàn thành xong bài " +
          $scope.idMHActive.tenMH +
          " rồi quay lại sau!!"
      );
    }
  };
  $scope.listMonHoc = [];
  $http({
    method: "GET",
    url: "JS/monhoc.js",
  }).then(
    function (response) {
      $scope.listMonHoc = response.data;
    },
    function (response) {
      alert("Lỗi rồi");
    }
  );
});

app.controller("doimatkhauCtrl", function ($scope, $rootScope, $timeout) {
  $scope.account = JSON.parse(sessionStorage.getItem("account"));
  $scope.doimatkhau = function () {
    if ($scope.formDoiMatKhau.$valid) {
      if ($rootScope.accountActive.passWord === $scope.password.cu) {
        $scope.account.passWord = $scope.password.moi;
        console.log($scope.account);
        $rootScope.accountActive = angular.copy($scope.account);
        $rootScope.listAccount[$rootScope.accountActive.id] = angular.copy(
          $scope.account
        );
        sessionStorage.setItem(
          "listAccount",
          JSON.stringify($rootScope.listAccount)
        );
        sessionStorage.setItem(
          "account",
          JSON.stringify($rootScope.accountActive)
        );
        $timeout(function () {
          $scope.password = {
            cu: "",
            moi: "",
          };
        }, 200);
        alert("Đổi mật khẩu thành công");
      } else {
        alert("Mật khẩu cũ không chính xác!!");
      }
    }
  };
});

app.controller(
  "quizCtrl",
  function ($scope, $rootScope, $routeParams, $http, $interval, $location) {
    // set thời gian
    $scope.time = sessionStorage.getItem("time");
    if ($scope.time == null) {
      $scope.time = 15 * 60;
    }

    $scope.countTime = "Time";
    $scope.tenbai = $routeParams.tenMH;
    $scope.id = $routeParams.id;
    $scope.listCauHoi = [];

    $scope.list10CauHoi = JSON.parse(sessionStorage.getItem("list10CauHoi"));
    if ($scope.list10CauHoi == null) {
      $scope.list10CauHoi = [];
    }

    $scope.listSelectedAnswer = JSON.parse(
      sessionStorage.getItem("listSelectedAnswer")
    );
    if ($scope.listSelectedAnswer == null) {
      $scope.listSelectedAnswer = new Array(10);
    }

    $scope.traloi = $scope.listSelectedAnswer[0];
    if ($scope.traloi == undefined) {
      $scope.traloi = [];
    }

    $scope.historyQuiz = JSON.parse(sessionStorage.getItem("historyQuiz"));
    if ($scope.historyQuiz == null) {
      $scope.historyQuiz = [];
    }
    $scope.thongbaodiem = [];
    $scope.start = 0;

    // kiểm tra các câu hỏi đã được check hết chưa
    $scope.flagAllAnswerSelected = true;
    $scope.diem = 0;
    $http({
      method: "GET",
      url: "database/" + $scope.id + ".js",
    }).then(
      function (response) {
        $scope.listCauHoi = response.data;
        if ($scope.list10CauHoi == "") {
          // xáo trộn câu hỏi
          for (let i = $scope.listCauHoi.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            let temp = $scope.listCauHoi[i];
            $scope.listCauHoi[i] = $scope.listCauHoi[j];
            $scope.listCauHoi[j] = temp;
          }
          for (let i = 0; i < 10; i++) {
            $scope.list10CauHoi[i] = $scope.listCauHoi[i];
          }
          sessionStorage.setItem(
            "list10CauHoi",
            JSON.stringify($scope.list10CauHoi)
          );
        }
      },
      function (response) {
        alert("Lỗi rồi");
      }
    );

    // nút kế tiếp
    $scope.next = function () {
      $scope.start += 1;
      if ($scope.start > $scope.list10CauHoi.length - 1) {
        $scope.start = 0;
      }
      $scope.traloi = angular.copy($scope.listSelectedAnswer[$scope.start]);
    };

    //nút trước đó
    $scope.prev = function () {
      $scope.start -= 1;
      if ($scope.start < 0) {
        $scope.start = $scope.list10CauHoi.length - 1;
      }
      $scope.traloi = angular.copy($scope.listSelectedAnswer[$scope.start]);
    };

    $rootScope.clock = $interval(function () {
      $scope.minutes = parseInt($scope.time / 60, 10);
      $scope.seconds = parseInt($scope.time % 60, 10);
      $scope.minutes =
        $scope.minutes < 10 ? "0" + $scope.minutes : $scope.minutes;
      $scope.seconds =
        $scope.seconds < 10 ? "0" + $scope.seconds : $scope.seconds;
      $scope.countTime = $scope.minutes + ":" + $scope.seconds;
      sessionStorage.setItem("time", $scope.time);
      if ($scope.time-- <= 0) {
        let btn = document.getElementById("btn-chamdiem");
        if (btn != null) {
          btn.click();
        } else {
          $interval.cancel($rootScope.clock);
          $scope.chamDiem();
        }
      }
    }, 1000);

    $scope.add = function (value) {
      $scope.listSelectedAnswer[$scope.start] = value;
      sessionStorage.setItem(
        "listSelectedAnswer",
        JSON.stringify($scope.listSelectedAnswer)
      );
    };

    // kiểm tra tất cả phần tử bên trong mảng có rỗng không
    $scope.hasEmptyElement = function (array) {
      for (var i = 0; i < array.length; i++) {
        if (array[i] == null) {
          $scope.flagAllAnswerSelected = true;
          return;
        }
      }
      $scope.flagAllAnswerSelected = false;
    };

    // tính điểm
    $scope.chamDiem = function () {
      $interval.cancel($rootScope.clock);
      try {
        for (let i = 0; i < $scope.list10CauHoi.length; i++) {
          if (
            $scope.list10CauHoi[i].AnswerId === $scope.listSelectedAnswer[i].Id
          ) {
            $scope.diem += $scope.list10CauHoi[i].Marks;
          }
        }
      } catch (error) {}

      $scope.thongbaodiem = {
        id: $scope.accountActive.id,
        name: $scope.accountActive.name,
        nameMH: $scope.tenbai,
        mark: $scope.diem + "/10",
        completionTime:
          15 -
          $scope.minutes +
          " phút " +
          ($scope.minutes == 0 ? "00" : 60 - $scope.seconds) +
          " giây",
        date: new Date(),
      };
      $scope.historyQuiz.push($scope.thongbaodiem);
      sessionStorage.removeItem("list10CauHoi");
      sessionStorage.removeItem("listSelectedAnswer");
      sessionStorage.removeItem("idMH");
      sessionStorage.removeItem("time");
      sessionStorage.setItem("historyQuiz", JSON.stringify($scope.historyQuiz));
    };
    $scope.pathChange = function (str) {
      $location.path(str);
    };
  }
);
