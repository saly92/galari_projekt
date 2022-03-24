//variabels

const cartBtn = document.querySelector(".cart-btn"); //bascket
const closeCartBtn = document.querySelector(".close-cart"); //closing cart slide
const clearCartBtn = document.querySelector(".clear-cart"); //clear the items from the bascket
const cartDOM = document.querySelector(".cart"); // big hell  the whol card in the bascket (photo pris up and down toral clearbtn)
const cartOverlay = document.querySelector(".cart-overlay"); //the big big Hell (big container)
const cartItems = document.querySelector(".cart-items"); //small container photo pris up and down
const cartTotal = document.querySelector(".cart-total"); //your totall prise
const cartContent = document.querySelector(".cart-content"); // big containerphoto pris up and down
const productsDOM = document.querySelector(".products-center"); //singel item

//cart
let cart = [];
//buttons
let buttonsDOM = [];

//getting the products
class Products {
  //methode
  /*?*/ async getProducts() {
    try {
      let result = await fetch("products.json");
      let data = await result.json();
      //return data;
      let products = data.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

//display products
class UI {
  displayProducts(products) {
    // console.log(products);
    let result = "";
    products.forEach((product) => {
      result += `
       <!-- single product -->
        <article class="product">
          <div class="img-container">
            <img src=${product.image} alt="" class="product-img" />
            <button class="bag-btn" data-id=${product.id}>
              <i class="fas fa-shopping-cart"></i>
              add to cart
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$ ${product.price}</h4>
        </article>
        <!--end of single product -->`;
    });
    productsDOM.innerHTML = result;
  }
  getBagButtons() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      }
      button.addEventListener("click", (event) => {
        event.target.innerText = "in Cart";
        event.target.disabled = true;
        // get product from products
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        // console.log(cartItem);

        //add product to the cart
        cart = [...cart, cartItem];

        // save cart in local storge
        Storage.saveCart(cart);
        //set cart values in local
        this.setCartValues(cart);
        //display cart item
        this.addCartItem(cartItem);
        //show the cart
        this.showCart();
      });
    });
  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
    // console.log( cartTotal, cartItems);
  }
  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = ` <img src=${item.image} alt="product">
            <div>
              <h4>${item.title}</h4>
              </h4>
              <h5>$${item.price}</h5>
              <span class="remove-item" data-id="${item.id}">remove</span>
            </div>
            <div>
              <i class="fas fa-chevron-up"data-id = ${item.id}></i>
              <p class="item-amount" >${item.amount}</p>
              <i class="fas fa-chevron-down" data-id = ${item.id}></i>
            </div>`;
    cartContent.appendChild(div);
  }
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }
  setupAPP() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }
  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }
  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }
  cartLogic() {
    //clear cart button
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    //cart functionality
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } 
      else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
       
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      }
      else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;

        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount-1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }
  clearCart() {
    let cartItems = cart.map((item) => item.id);
    console.log(cartContent.children);
    cartItems.forEach((id) => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
  }
  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}
//local storege

class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }
  static saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  //to save what we have already bought
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  //()callbackfunktion  general setup
  const ui = new UI();
  const products = new Products();
  // setup app
  ui.setupAPP();

  // get all products

  //>>>products.getProducts().then((data) => console.log(data));
  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });

  //wir haben unsere produckts noch nicht inconsole gesehen  >>>>>gehen wir oben im try und geben wir data .....>>reteurn data anstatt result ..jetzt sehen wir unsere items im console
});
