const toThousandths = (num) => {
  let integer = num.toString().split('.');
  integer[0] = integer[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return integer.join('.');
};

const BASE_URL = 'https://livejs-api.hexschool.io/api/livejs/v1';
const API_PATH = 'chian';
const TOKEN = 'R7HDoVFwq2cjqMEOnQD2VcPX5Xt1';

// 產品相關
const GET_PRODUCTS = `/customer/${API_PATH}/products`; // GET 取得產品列表

// 購物車相關
const GET_CARTS = `/customer/${API_PATH}/carts`; // GET 取得購物車內容
const POST_CARTS = `/customer/${API_PATH}/carts`; // POST加入購物車
const PATCH_CARTS = `/customer/${API_PATH}/carts`; // PATCH 修改購物車數量
const DELETE_CARTS = `/customer/${API_PATH}/carts`; // DELETE 清空購物車
const DELETE_CARTS_ID = `/customer/${API_PATH}/carts`; // DELETE 刪除單一購物車

// 訂單相關
const POST_ORDERS = `/customer/${API_PATH}/orders`; // POST 送出訂單

const API = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  baseURL: BASE_URL,
});

const getProducts = () => API.get(GET_PRODUCTS);
const getCarts = () => API.get(GET_CARTS);
const postCarts = (data) => API.post(POST_CARTS, { data });
const deleteCarts = (id) => API.delete(`${DELETE_CARTS}/${id}`);
const deleteCartsId = () => API.delete(DELETE_CARTS_ID);
const postOrders = (data) => API.post(POST_ORDERS, { data });

let products = [];
let carts = [];
const finalTotal = document.querySelector('.finalTotal');

const updateFinalTotal = (price) => {
  finalTotal.textContent = toThousandths(price);
};

const initProducts = async () => {
  try {
    const res = await getProducts();
    if (!res.data.status) {
      return console.log(res.data.message);
    }
    products = res.data.products;
    renderProductsLists(products);
  } catch (err) {
    console.log(err);
  }
};
const initCarts = async () => {
  try {
    const res = await getCarts();
    if (!res.data.status) {
      return console.log(res.data.message);
    }
    carts = res.data.carts;
    renderCartsLists(carts);
    const price = res.data.finalTotal;
    updateFinalTotal(price);
  } catch (err) {
    console.log(err);
  }
};

const productSelect = document.querySelector('.productSelect');
const handleProductSelect = (e) => {
  const category = e.target.value;
  if (category === '全部') {
    renderProductsLists(products);
    return;
  }
  const filterProduct = products.filter(
    (product) => product.category === category
  );
  renderProductsLists(filterProduct);
};
productSelect.addEventListener('change', handleProductSelect);

const productWrap = document.querySelector('.productWrap');
const renderProductsLists = (products) => {
  const lists = products
    .map(
      (product) => `<li class="productCard">
          <h4 class="productType">新品</h4>
          <img
            src="${product.images}"
            alt="${product.description}"
          />
          <a href="#" class="addCardBtn" data-id="${product.id}">加入購物車</a>
          <h3>${product.title}</h3>
          <del class="originPrice">NT$${toThousandths(
            product.origin_price
          )}</del>
          <p class="nowPrice">NT$${toThousandths(product.price)}</p>
        </li>`
    )
    .join('');
  productWrap.innerHTML = lists;
};

const addToCarts = async (data) => {
  try {
    const res = await postCarts(data);
    if (!res.data.status) {
      return console.log(res.data.message);
    }
    carts = res.data.carts;
    renderCartsLists(carts);
    const price = res.data.finalTotal;
    updateFinalTotal(price);
  } catch (err) {
    console.log(err);
  }
};

const handleClickProduct = (e) => {
  e.preventDefault();
  let addCartClass = e.target.getAttribute('class');
  if (addCartClass !== 'addCardBtn') return;
  let productId = e.target.getAttribute('data-id');
  let quantity = 1;
  carts.forEach((cart) => {
    if (cart.product.id === productId) {
      quantity = cart.quantity += 1;
    }
  });
  const data = { productId, quantity };
  addToCarts(data);
};
productWrap.addEventListener('click', handleClickProduct);

const shoppingCartTableBody = document.querySelector('.shoppingCart-tableBody');
const renderCartsLists = (carts) => {
  const lists = carts
    .map(
      (cart) => `<tr>
              <td>
                <div class="cardItem-title">
                  <img src="${cart.product.image}" alt="" />
                  <p>${cart.product.title}</p>
                </div>
              </td>
              <td>NT$${toThousandths(cart.product.price)}</td>
              <td>${cart.quantity}</td>
              <td>NT$${toThousandths(cart.product.price * cart.quantity)}</td>
              <td class="discardBtn">
                <a href="#" class="material-icons" data-id="${
                  cart.id
                }"> clear </a>
              </td>
            </tr>`
    )
    .join('');
  shoppingCartTableBody.innerHTML = lists;
};

const removeFromCarts = async (cartId) => {
  try {
    const res = await deleteCarts(cartId);
    if (!res.data.status) {
      return console.log(res.data.message);
    }
    carts = res.data.carts;
    renderCartsLists(carts);
    const price = res.data.finalTotal;
    updateFinalTotal(price);
  } catch (err) {
    console.log(err);
  }
};

const handleClickShoppingCartDelete = (e) => {
  e.preventDefault();
  let cartId = e.target.getAttribute('data-id');
  if (cartId == null) return;
  removeFromCarts(cartId);
};
shoppingCartTableBody.addEventListener('click', handleClickShoppingCartDelete);

const removeAllFromCarts = async (cartId) => {
  try {
    const res = await deleteCartsId(cartId);
    if (!res.data.status) {
      return console.log(res.data.message);
    }
    carts = res.data.carts;
    renderCartsLists(carts);
    const price = res.data.finalTotal;
    updateFinalTotal(price);
  } catch (err) {
    console.log(err);
  }
};

const discardAllBtn = document.querySelector('.discardAllBtn');
const handleClickShoppingCartDeleteAll = (e) => {
  e.preventDefault();
  removeAllFromCarts();
};
discardAllBtn.addEventListener('click', handleClickShoppingCartDeleteAll);

const orderInfoBtn = document.querySelector('.orderInfo-btn');
const handleSubmitOrderInfo = (e) => {
  e.preventDefault();
  const isCartsEmpty = carts.length === 0;
  if (isCartsEmpty) {
    console.log(
      '🚀 ~ file: index.js ~ line 220 ~ handleSubmitOrderInfo => 購物車是空的！！！'
    );
    return;
  }
  const customerName = document.querySelector('#customerName').value;
  const customerPhone = document.querySelector('#customerPhone').value;
  const customerEmail = document.querySelector('#customerEmail').value;
  const customerAddress = document.querySelector('#customerAddress').value;
  const tradeWay = document.querySelector('#tradeWay').value;
  if (
    customerName === '' ||
    customerPhone === '' ||
    customerEmail === '' ||
    customerAddress === '' ||
    tradeWay === ''
  ) {
    console.log(
      '🚀 ~ file: index.js ~ line 220 ~ handleSubmitOrderInfo => 訂單資訊尚未填寫完畢！！！'
    );
    return;
  }
  const data = {
    user: {
      name: customerName,
      tel: customerPhone,
      email: customerEmail,
      address: customerAddress,
      payment: tradeWay,
    },
  };
  postOrders(data);
  const orderInfoForm = document.querySelector('.orderInfo-form');
  orderInfoForm.reset();
};
orderInfoBtn.addEventListener('click', handleSubmitOrderInfo);

const init = () => {
  initProducts();
  initCarts();
};

init();
