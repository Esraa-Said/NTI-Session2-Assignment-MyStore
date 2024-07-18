const search = document.getElementById("search");
const selectCat = document.getElementById("selectCat");
const minPrice = document.getElementById("minPrice");
const maxPrice = document.getElementById("maxPrice");
const filterButton = document.getElementById("filterButton");
const sorting = document.getElementById("sort");
const productsSection = document.getElementById("products");
const pageContent = document.querySelector("#content");
const quantity = document.getElementById("quantity");
const price = document.getElementById("price");
const cart = document.getElementById("cart");
const yourCart = document.getElementById("your-cart");

const footer = document.createElement("footer");
const prevButton = document.createElement("button");
const nextButton = document.createElement("button");

const productsPerPage = 4;
let currentPage = 1;
let currentFilteredData = []; // Store filtered data globally
let totalPrice = 0;
let totalQuantity = 0;

const clear = () => {
  productsSection.innerHTML = "";
  footer.innerHTML = "";
};

filterButton.addEventListener("click", async () => {
  clear();
  const searchProduct = search.value.trim();
  const category = selectCat.value;
  const minPriceValue = Number(minPrice.value);
  const maxPriceValue = Number(maxPrice.value);
  const sortProducts = sorting.value;
  try {
    await fetchProducts(
      searchProduct,
      category,
      minPriceValue,
      maxPriceValue,
      sortProducts
    );
  } catch (error) {
    console.error("Error fetching product data:", error);
    alert("Failed to fetch products data. Please try again.");
  }
});

const fetchProducts = async (
  searchProduct,
  category,
  minPriceValue,
  maxPriceValue,
  sortProducts
) => {
  const url = "https://fakestoreapi.com/products";

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Products data fetch failed");
    const data = await response.json();
    if (data === null) throw new Error("No Products");
    console.log(data);
    currentFilteredData = await filtration(
      data,
      searchProduct,
      category,
      minPriceValue,
      maxPriceValue,
      sortProducts
    );

    changePage(currentFilteredData);
  } catch (error) {
    throw error;
  }
};

const filtration = async (
  data,
  searchProduct,
  category,
  minPriceValue,
  maxPriceValue,
  sortProducts
) => {
  let filteredData = data.slice();

  if (searchProduct) {
    filteredData = filteredData.filter((product) => {
      return product.title
        .trim()
        .toLowerCase()
        .includes(searchProduct.toLowerCase());
    });
  }

  if (category !== "All Categories") {
    filteredData = filteredData.filter((product) => {
      return product.category.trim().toLowerCase() === category.toLowerCase();
    });
  }
  if (minPriceValue && maxPriceValue) {
    filteredData = filteredData.filter((product) => {
      return product.price >= minPriceValue && product.price <= maxPriceValue;
    });
  } else if (minPriceValue) {
    filteredData = filteredData.filter((product) => {
      return product.price >= minPriceValue;
    });
  } else if (maxPriceValue) {
    filteredData = filteredData.filter((product) => {
      return product.price <= maxPriceValue;
    });
  }
  console.log(sortProducts);
  if (sortProducts === "Ascending") {
    filteredData.sort((a, b) => a.price - b.price);
  } else if (sortProducts === "Descending") {
    filteredData.sort((a, b) => b.price - a.price);
  }

  console.log(filteredData);

  return filteredData;
};

const getProductsPage = (data, page = 1) => {
  console.log(page);
  const start = (page - 1) * productsPerPage;
  const end = start + productsPerPage;
  return data.slice(start, end);
};

function changePage(data, page = 1) {
  clear();

  if (page < 1) return;
  const totalPages = Math.ceil(data.length / productsPerPage);
  if (page > totalPages) return;
  currentPage = page;

  const products = getProductsPage(data, page);
  displayProducts(products);
  if (totalPages > 1) {
    displayFooter(data, totalPages);
  }

  // Disable when
  prevButton.disabled = page === 1;
  nextButton.disabled = page === totalPages;
}

const displayProducts = (products) => {
  products.forEach((product) => {
    const newDiv = document.createElement("div");
    const newImg = document.createElement("img");
    const newTitle = document.createElement("h3");
    const newPrice = document.createElement("p");
    const newDetails = document.createElement("button");
    const newAdd = document.createElement("button");
    const cartProduct = document.createElement("p");
    let items = 1;
    newImg.src = product.image;
    newTitle.innerText = product.title;
    newPrice.innerText = `$${product.price}`;
    newDetails.innerText = "Details";
    newAdd.innerText = "Add to Cart";

    newAdd.addEventListener("click", () => {
      totalPrice += product.price;
      totalQuantity++;
      quantity.innerText = `Total Quantity: ${totalQuantity}`;
      price.innerText = `Total Price: ${totalPrice}`;
      cartProduct.innerText = `${product.title} - $${product.price} - ${items} `;
      items++;
    });
    newDiv.appendChild(newImg);
    newDiv.appendChild(newTitle);
    newDiv.appendChild(newPrice);
    newDiv.appendChild(newDetails);
    newDiv.appendChild(newAdd);
    quantity.parentNode.insertBefore(cartProduct, quantity);
    productsSection.appendChild(newDiv);
  });
};

const displayFooter = (data, totalPages) => {
  footer.innerHTML = ""; // Clear previous footer content

  productsSection.appendChild(footer);

  prevButton.innerText = "Previous";
  prevButton.removeEventListener("click", handlePrevClick);
  prevButton.addEventListener("click", handlePrevClick);
  footer.appendChild(prevButton);

  for (let i = 1; i <= totalPages; i++) {
    const span = document.createElement("span");
    span.innerText = i;
    if (currentPage === i) {
      span.style.backgroundColor = "rgb(0, 140, 255)";
      span.style.color = "rgb(255, 255, 255)";
    }
    span.addEventListener(
      "click",
      ((pageNumber) => {
        return () => changePage(data, pageNumber);
      })(i)
    );
    footer.appendChild(span);
  }

  nextButton.innerText = "Next";
  nextButton.removeEventListener("click", handleNextClick);
  nextButton.addEventListener("click", handleNextClick);
  footer.appendChild(nextButton);
};

const handlePrevClick = () => {
  changePage(currentFilteredData, currentPage - 1);
};

const handleNextClick = () => {
  changePage(currentFilteredData, currentPage + 1);
};
