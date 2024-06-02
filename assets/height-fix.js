// Function to set the height of card titles based on the tallest one
function setCardTitleHeight(selector) {
  // Get all elements with the specified selector
  var cardTitles = document.querySelectorAll(selector);

  // Reset the height of all card titles
  cardTitles.forEach(function (title) {
    title.style.height = "auto";
  });

  // Initialize variable to keep track of tallest height
  var tallestHeight = 0;

  // Loop through each card title to find the tallest one
  cardTitles.forEach(function (title) {
    var titleHeight = title.offsetHeight; // Get the height of the current card title
    if (titleHeight > tallestHeight) {
      tallestHeight = titleHeight; // Update tallest height if the current card title is taller
    }
  });

  // Set the height of all card titles to match the tallest one
  cardTitles.forEach(function (title) {
    title.style.height = tallestHeight + "px";
  });
}

// Call the function initially when the window loads
window.addEventListener("load", function () {
  // Set card title height for navbar menu items on all screen sizes
  setCardTitleHeight(".collection-slider .product-info");
  setCardTitleHeight(".collection-grid .product-info");
});

// Call the function when resizing the window
window.addEventListener("resize", function () {
  // Set card title height for navbar menu items on all screen sizes
  setCardTitleHeight(".collection-slider .product-info");
  setCardTitleHeight(".collection-grid .product-info");
});
// // Call the function whenever the window is resized
// window.addEventListener('resize', function () {
//     var screenWidth = window.innerWidth;

//     if (screenWidth >= 500 && screenWidth <= 1000) {
//         setCardTitleHeight('.article-info .article-title');
//         setCardTitleHeight('.article-info .article-excerpt');
//     }
// });
