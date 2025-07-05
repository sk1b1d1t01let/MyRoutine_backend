const searchMeals = async (name) => {
  const api = "0c1fa745903d49d292fe230bfd070382";
  if (!name) return;

  const res1 = await fetch(
    `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(
      name
    )}&number=1&apiKey=${api}`
  );
  if (!res1.ok) {
    const errorData = await res1.json();
    throw new Error(
      `Search API error: ${errorData.message || res1.statusText}`
    );
  }
  const data1 = await res1.json();
  const meal = data1.results[0];
  console.log("meal ID: " + meal.id);

  const res2 = await fetch(
    `https://api.spoonacular.com/recipes/${meal.id}/information?includeNutrition=true&apiKey=${api}`
  );
  if (!res2.ok) {
    const errorData = await res2.json();
    throw new Error(
      `Details API error: ${errorData.message || res2.statusText}`
    );
  }

  console.log("fetched detailed info");
  const data2 = await res2.json();

  const nutrition = {
    nutrients: data2.nutrition.nutrients,
    caloricBreakdown: data2.nutrition.caloricBreakdown,
    weightPerServing: data2.nutrition.weightPerServing,
  };

  const finalAnswer = {
    img: meal.image,
    ingredients: [{ nutrition: nutrition }],
  };

  return finalAnswer;
};

export default searchMeals;
