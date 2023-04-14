const getBeers = async () => {
  const response = await fetch("https://api.punkapi.com/v2/beers");
  const data = await response.json();
  return data;
};

const createLabels = async (beerFridge) => {
  return beerFridge.map((beer) => {
    return {
      id: beer.id,
      name: beer.name,
      tagline: beer.tagline,
      abv: beer.abv,
      ibu: beer.ibu,
      image: beer.image_url,
      description: beer.description,
    };
  });
};

const createBeerLabelElement = (label) => {
  const card = document.createElement("div");
  card.className = "beer-label";

  const beerName = document.createElement("p");
  beerName.textContent = label.name;
  card.appendChild(beerName);

  const tagline = document.createElement("p");
  tagline.textContent = label.tagline;
  card.appendChild(tagline);

  const abv = document.createElement("p");
  abv.textContent = `ABV: ${label.abv}%`;
  card.appendChild(abv);

  const ibu = document.createElement("p");
  ibu.textContent = `IBU: ${label.ibu}`;
  card.appendChild(ibu);

  const image = document.createElement("img");
  image.src = label.image;
  image.alt = label.name;
  image.style.width = "clamp(5vmin, 7.5%, 2rem)";

  card.appendChild(image);

  const description = document.createElement("figcaption");
  description.textContent = label.description;
  description.style.padding = "1rem";
  card.appendChild(description);
  return card;
};

const createIngredientsList = (ingredients) => {
  const ingredientsList = document.createElement("ul");

  const maltListItem = document.createElement("li");
  maltListItem.textContent = `Malt: ${ingredients.malt
    .map((malt) => malt.name)
    .join(", ")}`;
  ingredientsList.appendChild(maltListItem);

  const hopsListItem = document.createElement("li");
  hopsListItem.textContent = `Hops: ${ingredients.hops
    .map((hop) => hop.name)
    .join(", ")}`;
  ingredientsList.appendChild(hopsListItem);

  const yeastListItem = document.createElement("li");
  yeastListItem.textContent = `Yeast: ${ingredients.yeast}`;
  ingredientsList.appendChild(yeastListItem);

  return ingredientsList;
};

const createBeerModal = (beer, i) => {
  const modal = document.createElement("div");
  modal.id = `modal-${i}`;
  modal.className = "modal-content";

  const name = document.createElement("h2");
  name.textContent = beer.name;
  modal.appendChild(name);

  const creator = document.createElement("p");
  creator.textContent = `Creator: ${beer.contributed_by}`;
  modal.appendChild(creator);

  const firstBrewed = document.createElement("p");
  firstBrewed.textContent = beer.first_brewed;
  modal.appendChild(firstBrewed);

  const volume = document.createElement("p");
  volume.textContent = `Volume: ${beer.volume["value"]} ${beer.volume["unit"]} | Boil Volume:  ${beer.boil_volume["value"]} ${beer.boil_volume["unit"]}`;
  modal.appendChild(volume);

  const stats = document.createElement("p");
  stats.textContent = `ABV: ${beer.abv} | EBC: ${beer.ebc} | IBU: ${beer.ibu} | PH: ${beer.ph} | SRM: ${beer.srm} | Attenuation: ${beer.attenuation_level}`;
  modal.appendChild(stats);

  const gravity = document.createElement("p");
  gravity.textContent = `OG: ${beer.target_og} | FG: ${beer.target_fg}`;
  modal.appendChild(gravity);

  const ingredients = createIngredientsList(beer.ingredients);
  modal.appendChild(ingredients);

  const brewerTips = document.createElement("p");
  brewerTips.textContent = beer.brewers_tips;
  modal.appendChild(brewerTips);

  const foodPairing = document.createElement("p");
  console.log(beer.food_pairing);
  foodPairing.textContent = `${beer.food_pairing.map((p) => p).join(", ")}`;
  modal.appendChild(foodPairing);

  return modal;
};

async function main(container) {
  const beerFridge = await getBeers();
  const beerLabels = await createLabels(beerFridge);

  const beerLabelElements = beerLabels.map((label) => {
    return createBeerLabelElement(label);
  });

  const beerLabelContainer = document.createElement("div");
  beerLabelContainer.id = "beer-label-container";
  container.appendChild(beerLabelContainer);

  beerLabelElements.forEach((element) => {
    element.style.border = "solid";
    beerLabelContainer.appendChild(element);
  });

  const mainModal = document.getElementById("main-modal");
  mainModal.addEventListener("click", (e) => {
    closeModal(mainModal);
  });

  const recipeModals = beerFridge.map((beer, index) => {
    return createBeerModal(beer, index);
  });

  const openModal = (modalContent) => {
    if (mainModal.children.length !== 0) {
      mainModal.replaceChild(modalContent, mainModal.children[0]);
    }
    mainModal.appendChild(modalContent);
    mainModal.style.display = "flex";
    mainModal.style.justifyContent = "center";
    mainModal.style.alignItems = "center";
  };

  beerLabelElements.forEach((beer, i) => {
    beer.addEventListener("click", (e) => {
      const targetModal = recipeModals.find((m) => m.id === `modal-${i}`);
      if (targetModal) {
        openModal(targetModal);
      }
    });
  });

  const closeModal = (modalContainer) => {
    modalContainer.style.display = "none";
  };

  const labels = document.querySelectorAll(".beer-label");
  let currentIndex = 0;
  let isScrolling = false;

  container.addEventListener("scroll", () => {
    isScrolling = true;
  });

  setInterval(() => {
    if (isScrolling) {
      isScrolling = false;

      const containerHeight = container.clientHeight;
      const scrollPosition = container.scrollTop;

      let nearestDistance = Infinity;
      let nearestIndex = -1;

      labels.forEach((label, index) => {
        const labelTop = label.offsetTop;
        const labelHeight = label.clientHeight;

        const distance = Math.abs(
          labelTop - containerHeight / 2 - scrollPosition
        );

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      const nearestLabel = labels[nearestIndex];
      const nearestLabelTop = nearestLabel.offsetTop;
      const nearestLabelHeight = nearestLabel.clientHeight;

      container.scrollTo({
        top: nearestLabelTop - containerHeight / 2,
        behavior: "smooth",
      });

      currentIndex = nearestIndex;

      labels.forEach((label, index) => {
        if (index === currentIndex) {
          label.classList.add("current");
        } else {
          label.classList.remove("current");
        }
      });
    }
  }, 500);
}
document.addEventListener("DOMContentLoaded", function () {
  const body = document.querySelector("body");

  const header = document.createElement("h1");
  header.textContent = "Welcome to Punk Beer!";
  body.appendChild(header);

  const container = document.querySelector(".container");

  const modal = document.createElement("div");
  modal.id = "main-modal";
  body.appendChild(modal);

  main(container);
});
