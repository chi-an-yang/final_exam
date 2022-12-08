const formatTimestampToDate = (timestamp) => {
  const orderTime = new Date(timestamp * 1000);
  const day = orderTime.getDate();
  const month = orderTime.getMonth() + 1;
  const year = orderTime.getFullYear();
  return `${year}/${month}/${day}`;
};

const orderPaidStatus = (status) => {
  return status ? '已處理' : '未處理';
};

const BASE_URL = 'https://livejs-api.hexschool.io/api/livejs/v1';
const API_PATH = 'chian';
const TOKEN = 'R7HDoVFwq2cjqMEOnQD2VcPX5Xt1';

// 訂單相關（管理者）
const GET_ORDERS = `/admin/${API_PATH}/orders`; // GET 後台顯示訂單列表
const PUT_ORDERS = `/admin/${API_PATH}/orders`; // PUT 後台編輯單一訂單
const DELETE_ORDERS = `/admin/${API_PATH}/orders`; // DELETE 後台刪除全部訂單
const DELETE_ORDERS_ID = `/admin/${API_PATH}/orders`; // DELETE 後台刪除特定訂單

const API = axios.create({
  headers: {
    'Content-Type': 'application/json',
    Authorization: TOKEN,
  },
  baseURL: BASE_URL,
});

let orders = [];

const getOrders = () => API.get(GET_ORDERS);
const putOrders = (status, id) =>
  API.put(PUT_ORDERS, { data: { paid: status ? true : false, id } });
const deleteOrdersId = (id) => API.delete(`${DELETE_ORDERS_ID}/${id}`);
const deleteOrders = () => API.delete(DELETE_ORDERS);

const initOrders = async () => {
  try {
    const res = await getOrders();
    if (!res.data.status) {
      return console.log(res.data.message);
    }
    orders = res.data.orders;
    renderOrdersLists(orders);
  } catch (err) {
    console.log(err);
  }
};

const orderPageTableBody = document.querySelector('.orderPageTableBody');
const renderOrdersLists = (orders) => {
  const lists = orders
    .map(
      (order) => `<tr>
              <td>10088377474</td>
              <td>
                <p>${order.user.name}</p>
                <p>${order.user.tel}</p>
              </td>
              <td>${order.user.address}</td>
              <td>${order.user.email}</td>
              <td>
                ${order.products
                  .map(
                    (product) => `<p>${product.title}x${product.quantity}</p>`
                  )
                  .join('')}
              </td>
              <td>${formatTimestampToDate(order.createdAt)}</td>
              <td>
                <a href="#" class="orderStatus"  data-status="${
                  order.paid
                }" data-id="${order.id}">${orderPaidStatus(order.paid)}</a>
              </td>
              <td>
                <input type="button" class="delSingleOrder-Btn" value="刪除" data-id="${
                  order.id
                }" />
              </td>
            </tr>`
    )
    .join('');
  orderPageTableBody.innerHTML = lists;
  // renderC3(orders)
  renderC3Lv2(orders);
};

const renderC3 = (orders) => {
  console.log('🚀 ~ file: admin.js ~ line 88 ~ renderC3 ~ orders', orders);
  let total = {};
  orders.forEach((order) => {
    order.products.forEach((product) => {
      if (total[product.category] == undefined) {
        total[product.category] = product.price * product.quantity;
      } else {
        total[product.category] += product.price * product.quantity;
      }
    });
  });
  // C3.js
  let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
      type: 'pie',
      columns: [...Object.entries(total)],
    },
  });
};

const renderC3Lv2 = (orders) => {
  console.log('🚀 ~ file: admin.js ~ line 88 ~ renderC3 ~ orders', orders);
  let total = {};
  orders.forEach((order) => {
    order.products.forEach((product) => {
      if (total[product.title] == undefined) {
        total[product.title] = product.price * product.quantity;
      } else {
        total[product.title] += product.price * product.quantity;
      }
    });
  });

  let columns = Object.entries(total);
  columns.sort((a, b) => b[1] - a[1]);

  if (columns.length > 3) {
    let otherTotal = 0;
    columns.forEach((item, index) => {
      if (index > 2) {
        otherTotal += columns[index][1];
      }
    });
    columns.splice(3, columns.length - 1);
    columns.push(['其他', otherTotal]);
  }
  console.log(
    '🚀 ~ file: admin.js ~ line 124 ~ renderC3Lv2 ~ columns',
    columns
  );

  // C3.js
  let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
      type: 'pie',
      columns: [...columns],
    },
  });
};

const handleClickOrdersDelete = (e) => {
  e.preventDefault();
  let targetClassName = e.target.getAttribute('class');
  const id = e.target.getAttribute('data-id');
  if (targetClassName === 'orderStatus') {
    const status = e.target.getAttribute('data-status');
    changeOrdersStatus(status, id);
    return;
  }

  if (targetClassName === 'delSingleOrder-Btn') {
    removeOrderFromOrders(id);
    return;
  }
};
orderPageTableBody.addEventListener('click', handleClickOrdersDelete);

const changeOrdersStatus = async (status, id) => {
  try {
    const res = await putOrders(status, id);
    if (!res.data.status) {
      return console.log(res.data.message);
    }
    orders = res.data.orders;
    renderOrdersLists(orders);
  } catch (err) {
    console.log(err);
  }
};

const removeOrderFromOrders = async (id) => {
  try {
    const res = await deleteOrdersId(id);
    if (!res.data.status) {
      return console.log(res.data.message);
    }
    orders = res.data.orders;
    renderOrdersLists(orders);
  } catch (err) {
    console.log(err);
  }
};

const removeAllFromOrders = async () => {
  try {
    const res = await deleteOrders();
    if (!res.data.status) {
      return console.log(res.data.message);
    }
    orders = res.data.orders;
    renderOrdersLists(orders);
  } catch (err) {
    console.log(err);
  }
};

const handleClickOrdersDeleteAll = (e) => {
  e.preventDefault();
  removeAllFromOrders();
};

const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click', handleClickOrdersDeleteAll);

const init = () => {
  initOrders();
};

init();
