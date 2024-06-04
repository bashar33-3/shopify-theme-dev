document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search-input");
  const searchResultsContainer = document.getElementById("search-results");
  const clearButton = document.getElementById("clear-search");

  searchInput.addEventListener("input", function () {
    const query = searchInput.value.trim();

    if (query.length > 0) {
      fetchPredictiveSearchResults(query);
    } else {
      searchResultsContainer.classList.remove("visible");
      searchResultsContainer.innerHTML = "";
    }
  });

  clearButton.addEventListener("click", function () {
    searchInput.value = "";
    searchResultsContainer.classList.remove("visible");
    searchResultsContainer.innerHTML = "";
    searchInput.focus(); // Optional: keep the input focused after clearing
  });

  function fetchPredictiveSearchResults(query) {
    fetch(
      `/search/suggest.json?q=${query}&resources[type]=product,collection,article,page&resources[limit]=20`
    ) // Increase the limit as needed
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        displaySearchResults(data.resources.results);
      })
      .catch((error) => {
        console.error("Error fetching search results:", error);
      });
  }

  function displaySearchResults(results) {
    searchResultsContainer.innerHTML = ""; // Clear previous results

    const { products, collections, pages, articles } = results;

    if (
      products.length > 0 ||
      collections.length > 0 ||
      pages.length > 0 ||
      articles.length > 0
    ) {
      searchResultsContainer.classList.add("visible");

      const resultSections = {
        products: createResultsSection("Products", products),
        collections: createResultsSection("Collections", collections),
        pages: createResultsSection("Pages", pages),
        articles: createResultsSection("Articles", articles),
      };

      const titleContainer = document.createElement("div");
      titleContainer.classList.add(
        "search-result-title",
        "dflex-row",
        "gap-10"
      );

      let firstSection = true; // Flag to track the first section

      for (const section in resultSections) {
        if (
          resultSections[section] &&
          resultSections[section].items.children.length > 0
        ) {
          const sectionTitle = document.createElement("h4");
          sectionTitle.textContent = resultSections[section].title;
          sectionTitle.dataset.section = section; // Add data attribute
          titleContainer.appendChild(sectionTitle);

          if (firstSection) {
            resultSections[section].items.classList.add("visible"); // Make the first section visible
            firstSection = false;
          }

          searchResultsContainer.appendChild(resultSections[section].items);
        }
      }

      searchResultsContainer.appendChild(titleContainer);

      addToggleFunctionality();
    } else {
      const noResultsDiv = document.createElement("div");
      noResultsDiv.classList.add("no-results");
      noResultsDiv.innerHTML = `<h3 class='fs-20 ff-secondary fw-regular text-center'>No results could be found.</h3>`;
      searchResultsContainer.appendChild(noResultsDiv);
      searchResultsContainer.classList.add("visible");
    }
  }

  function createResultsSection(title, items) {
    const itemsContainer = document.createElement("div");
    itemsContainer.classList.add("search-result-items");
    itemsContainer.dataset.section = title.toLowerCase();

    items.forEach((item) => {
      // Check if item and item.url are both defined before accessing item.url
      if (item && item.url) {
        let priceString = "";
        let priceWithDecimal = "";

        // Check if the parent div has a data attribute of "products"
        if (itemsContainer.dataset.section === "products") {
          priceString = String(item.price);

          // Ensure priceString has at least three characters
          if (priceString.length < 3) {
            priceString = priceString.padStart(3, "0");
          }

          priceWithDecimal = priceString.slice(0, -2) + priceString.slice(-2);
        }

        const resultItem = document.createElement("div");
        resultItem.classList.add("search-result-item");

        resultItem.innerHTML = `
                <div class='cart-item-inner'>
                    ${
                      // Conditionally include the image if the parent div is not "pages"
                      itemsContainer.dataset.section !== "pages"
                        ? `<div class="cart-item-image">
                                <img src="${item.featured_image.url}" alt="${item.title}">
                            </div>`
                        : ""
                    }
                    <div class='dflex-row justify-content-sb'>
                        <div class="cart-item-details">
                            <div class="cart-item-title">
                                <a href="${item.url}">
                                    <h3 class="underline-animation fs-16">${
                                      item.title
                                    }</h3>
                                </a>
                            </div>
                            ${
                              // Conditionally include the price if the parent div is "products"
                              itemsContainer.dataset.section === "products"
                                ? `<div class="cart-item-price text-neutral-100-7 fs-16">$${priceWithDecimal}</div>`
                                : ""
                            }
                        </div>
                    </div>
                </div>
            `;

        itemsContainer.appendChild(resultItem);
      }
    });

    return { title, items: itemsContainer };
  }
  function addToggleFunctionality() {
    const sections = document.querySelectorAll(".search-result-title h4");

    sections.forEach((section) => {
      section.addEventListener("click", function () {
        const sectionName = this.dataset.section;
        const itemsContainer = document.querySelector(
          `.search-result-items[data-section="${sectionName}"]`
        );

        if (itemsContainer.classList.contains("visible")) {
          // If the clicked section is already visible, do nothing
          return;
        } else {
          // Hide all other items containers and remove active class from all titles
          const allItemsContainers = document.querySelectorAll(
            ".search-result-items"
          );
          allItemsContainers.forEach((container) => {
            container.classList.remove("visible");
          });

          sections.forEach((title) => {
            title.classList.remove("active");
          });

          // Show the clicked items container and add active class to the title
          itemsContainer.classList.add("visible");
          this.classList.add("active");
        }
      });
    });

    // Set the initial active title and visible items container
    const firstVisibleContainer = document.querySelector(
      ".search-result-items.visible"
    );
    if (firstVisibleContainer) {
      const firstVisibleSectionName = firstVisibleContainer.dataset.section;
      const firstVisibleTitle = document.querySelector(
        `.search-result-title h4[data-section="${firstVisibleSectionName}"]`
      );
      if (firstVisibleTitle) {
        firstVisibleTitle.classList.add("active");
      }
    }
  }
});
