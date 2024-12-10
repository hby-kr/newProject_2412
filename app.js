/*
* (ex) 쿠팡같은 상황
1. 로그인 유저를 먼저 불러오기 (상품 리스트 / 공휴일 데이터)
2. 그 유저와 관련된 데이터 불러오기 (장바구니 / 스케쥴)
*/

let loginUser;
let products;
let baskets;
const basketCont = document.querySelector("#basketCont");
const totalPriceB = document.querySelector("#totalPriceB");
const loadBasketsBtn = document.querySelector("#loadBasketsBtn");
const basketEx = document.querySelector("#basketEx");

let basketsObj = {}; // 화면이 로딩되면 ajax로 불러오는 장바구니 리스트. 현재 undefined
// BasketsObj는 나중에 { 999: {num:999, title:"버터", ..}, total:11000 }

// [클래스문법으로 메서드 정의하기]
class BasketsObj {
  setBasket(basket) {
    // 매개변수는 (form이 매개변수로 들어간) Basket함수
    if (basket.num in this) {
      alert("이미 존재합니다. 갱신하는 것은 작업해볼게요");
    } else {
      this[basket.num] = basket; // 객체의 필드추가
      this.total += basket.total;
    }
  }

  delBasket(num) {
    // 매개변수는 삭제버튼의 data- 로 등록된 숫자
    if (num in this) {
      // 만약 같은 숫자가 이미 있으면
      this.total -= this[num].total; // 전체 가격에서 그 해당 상품의 가격 빼기.
      delete this[num]; // 그 번호로 된 key 필드를 삭제.
      // delete 명령은 JavaScript에서 객체에서 특정 속성을 삭제할 때 사용하는 연산자
    } else {
      alert("이미 삭제된 상품입니다.");
    }
  }
}

// 단지 type을 만들었을 뿐.
function Basket(form) {
  // 매개변수 == 각 상품의 폼요소임 들어가서 key:value쌍들을 가지는 객채로 만들어짐.
  this.num = Number(form.num.value);
  this.title = form.title.value;
  this.price = Number(form.price.value);
  this.cnt = Number(form.cnt.value);
  this.total = this.price * this.cnt;
}

// 상품이 장바구니에 물건이 담길 때 실행
const submitHandeler = function (e) {
  e.preventDefault();
  let basket = new Basket(this); // this는 form요소 -> 위 Basket 타입에 넣어서 다시,
  basketsObj.setBasket(basket); //  BasketsObj의 메서드에 넣음
  printBasketObj(); // 그리고 다시 장바구니 출력.
};

// 장바구니 출력 함수
// 사용 경우: 화면이 로딩되면 / 장바구니에 물건일 담길 때 / 장바구니가 삭제될 때

const printBasketObj = () => {
  basketCont.innerHTML = "";

  // basketsObj는 나중에 { 999: {num:999, title:"버터", ..} }
  for (let num in basketsObj) {
    if (isNaN(num)) continue; // === if(num==total), 반복문의 해당 구문만 넘겨라.

    let basket = basketsObj[num]; // basket은 각 상품 객체임
    console.log("🚀 ~ printBasketObj ~ basket:", basket);

    let tr = basketEx.cloneNode(true);
    tr.removeAttribute("id");

    for (let key in basket) {
      let td = tr.querySelector("." + key);
      td.append(document.createTextNode(basket[key]));
    }

    let delBtn = tr.querySelector(".delBtn");
    delBtn.dataset.num = basket.num; //data-num=3
    delBtn.onclick = (e) => {
      let delNum = e.target.dataset.num;
      basketsObj.delBasket(delNum); // delBasket메서드에 번호 넣어서 실행해.
      printBasketObj(); // 다시 출력해
    };
    basketCont.append(tr);
    totalPriceB.innerText = 0;
    totalPriceB.innerText += basketsObj[num]["total"];
  }
};

const loadBasketsFunc = () => {
  basketsObj.__proto__ = BasketsObj.prototype;
  console.log("🚀 ~ loadBasketsFunc ~ basketsObj:", basketsObj);

  printBasketObj(); // 리팩토링
};

loadBasketsBtn.onclick = loadBasketsFunc;

// ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 상품리스트
const loadProductsBtn = document.getElementById("loadProductsBtn");
const productList = document.getElementById("productList");
const productEx = document.getElementById("productEx");

const loadProducts = () => {
  productList.innerHTML = ""; // 기존거 지우기. 중복방지.

  products.forEach((product) => {
    let ex = productEx.cloneNode(true);
    ex.removeAttribute("id");

    for (let key in product) {
      let node = ex.querySelector("." + key);
      let form = ex.querySelector(".basketForm");

      if (key === "img[src]") {
        node.src = product[key];
      } else {
        node?.append(document.createTextNode(product[key])); // num은 없으니까 ?.로 썼음
        form[key].value = product[key];
      }
      form.onsubmit = submitHandeler;
    }
    productList.append(ex);
  });
};

loadProductsBtn.onclick = loadProducts;

// ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 파일 불러오기 ajax 설정

const loadData = async function () {
  let resArr = await Promise.all([
    fetch("./loginUser.json"), // 파일 불러오기
    fetch("./products.json"), // 파일 불러오기
  ]); // [Response, Response]

  // Promise.all을 써서 [Response, Response] 배열로 Response 결과가 왔으니
  //1-1) 직접 명령해서 객체로 만들기
  // let objArr = await Promise.all([
  //   resArr[0].json(),  // json() 메서드 호출
  //   resArr[1].json()   // json() 메서드 호출
  // ]);
  //1-2) Array 객체니까 map 메서드를 사용해서 Response의 결과값을 객체로 만들어서, 다시 배열로 반환
  let objArr = await Promise.all(resArr.map((res) => res.json()));
  // [ {…},                        Array(6)]
  // [ {사용자정보 키&값 객체}},  [ 6개의 객체가 들어있는 배열] ]

  // 배열로 왔으니, 객체를 각각 꺼내서 변수 설정하기
  loginUser = objArr[0];
  console.log("🚀 ~ loginUser:", loginUser);
  products = objArr[1];
  console.log("🚀 ~ products:", products);
  loadProducts();

  let res3 = await fetch(`./${loginUser["user_id"]}Baskets.json`);
  baskets = await res3.json();
  basketsObj = baskets;
  console.log("🚀 ~ baskets:", baskets);
  // 사용자정보 객체에서 값 꺼내서 해당 파일(사용자의 장바구니 목록) 가져오기
  loadBasketsFunc();
  
};
loadData();
