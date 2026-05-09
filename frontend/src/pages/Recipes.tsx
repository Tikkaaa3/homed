import { useState, useEffect } from 'react';
import client from '../api/client';
import { ChefHat, Trash2, Plus, Search } from 'lucide-react';

interface Item {
  id: string;
  name: string;
  category: string;
  unit: string;
  houseId: string;
}

interface Ingredient {
  id: string;
  recipeId: string;
  itemId: string;
  quantity: number;
  unitOverride: string | null;
  item: Item;
}

interface Recipe {
  id: string;
  title: string;
  type: string;
  houseId: string;
  ingredients: Ingredient[];
}

const recipeTypes = ['MEAL', 'DESSERT'];

const Recipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('MEAL');
  const [submitting, setSubmitting] = useState(false);

  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [suggestedRecipes, setSuggestedRecipes] = useState<Recipe[] | null>(null);
  const [suggesting, setSuggesting] = useState(false);

  const [ingredientForms, setIngredientForms] = useState<
    Record<string, { itemId: string; quantity: string }>
  >({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recipesRes, itemsRes] = await Promise.all([
        client.get('/recipes'),
        client.get('/items'),
      ]);
      setRecipes(recipesRes.data);
      setItems(itemsRes.data);
    } catch {
      alert('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const res = await client.post('/recipes', { title, type });
      setRecipes((prev) => [{ ...res.data, ingredients: [] }, ...prev]);
      setTitle('');
      setType('MEAL');
    } catch {
      alert('Failed to create recipe');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await client.delete(`/recipes/${id}`);
      setRecipes((prev) => prev.filter((r) => r.id !== id));
      setSuggestedRecipes((prev) => prev?.filter((r) => r.id !== id) ?? null);
    } catch {
      alert('Failed to delete recipe');
    }
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleSuggest = async () => {
    if (selectedItemIds.size === 0) {
      alert('Select at least one item');
      return;
    }
    setSuggesting(true);
    try {
      const res = await client.post('/recipes/suggest', {
        itemIds: Array.from(selectedItemIds),
      });
      setSuggestedRecipes(res.data);
    } catch {
      alert('Failed to get suggestions');
    } finally {
      setSuggesting(false);
    }
  };

  const getIngredientForm = (recipeId: string) =>
    ingredientForms[recipeId] || { itemId: '', quantity: '' };

  const handleAddIngredient = async (recipeId: string) => {
    const { itemId, quantity } = getIngredientForm(recipeId);
    if (!itemId || !quantity) return;
    const qtyNum = parseFloat(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) return;

    try {
      const res = await client.post(`/recipes/${recipeId}/ingredients`, {
        itemId,
        quantity: qtyNum,
      });
      setRecipes((prev) =>
        prev.map((r) =>
          r.id === recipeId
            ? { ...r, ingredients: [...r.ingredients, res.data] }
            : r
        )
      );
      setIngredientForms((prev) => ({
        ...prev,
        [recipeId]: { itemId: '', quantity: '' },
      }));
    } catch {
      alert('Failed to add ingredient');
    }
  };

  const handleRemoveIngredient = async (recipeId: string, ingredientId: string) => {
    try {
      await client.delete(`/recipes/${recipeId}/ingredients/${ingredientId}`);
      setRecipes((prev) =>
        prev.map((r) =>
          r.id === recipeId
            ? { ...r, ingredients: r.ingredients.filter((i) => i.id !== ingredientId) }
            : r
        )
      );
    } catch {
      alert('Failed to remove ingredient');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recipes</h1>

      {/* Suggestion Engine */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Search size={20} className="text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            What can I cook?
          </h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Select the items you have available and we'll suggest recipes you can make.
        </p>
        <div className="flex flex-wrap gap-2">
          {items.map((item) => {
            const selected = selectedItemIds.has(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggleItemSelection(item.id)}
                className={`px-3 py-1.5 rounded-full text-sm border transition ${
                  selected
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </div>
        <button
          onClick={handleSuggest}
          disabled={suggesting || items.length === 0}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2"
        >
          <ChefHat size={18} />
          {suggesting ? 'Searching...' : 'Suggest Recipes'}
        </button>

        {suggestedRecipes !== null && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-md font-medium text-gray-800 dark:text-gray-100 mb-3">
              {suggestedRecipes.length === 0
                ? 'No recipes found with those items.'
                : `Found ${suggestedRecipes.length} recipe${suggestedRecipes.length !== 1 ? 's' : ''}`}
            </h3>
            {suggestedRecipes.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {suggestedRecipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="p-4 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {recipe.title}
                      </h4>
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                        {recipe.type}
                      </span>
                    </div>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      {recipe.ingredients.map((ing) => (
                        <li key={ing.id}>
                          {ing.item.name} — {ing.quantity} {ing.unitOverride || ing.item.unit}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Create Recipe */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Create New Recipe
        </h2>
        <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Recipe title"
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {recipeTypes.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0) + t.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            <Plus size={18} />
            {submitting ? 'Creating...' : 'Create Recipe'}
          </button>
        </form>
      </section>

      {/* All Recipes */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          All Recipes
        </h2>
        {recipes.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No recipes yet. Create one above!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {recipe.title}
                    </h3>
                    <span className="inline-block mt-1 text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                      {recipe.type}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(recipe.id)}
                    className="text-gray-400 hover:text-red-500 transition"
                    title="Delete recipe"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div>
                  {recipe.ingredients.length === 0 ? (
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      No ingredients yet.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {recipe.ingredients.map((ing) => (
                        <li
                          key={ing.id}
                          className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-200"
                        >
                          <span>
                            {ing.item.name} — {ing.quantity}{' '}
                            {ing.unitOverride || ing.item.unit}
                          </span>
                          <button
                            onClick={() => handleRemoveIngredient(recipe.id, ing.id)}
                            className="text-gray-400 hover:text-red-500 transition"
                            title="Remove ingredient"
                          >
                            <Trash2 size={14} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2">
                    <select
                      value={getIngredientForm(recipe.id).itemId}
                      onChange={(e) =>
                        setIngredientForms((prev) => ({
                          ...prev,
                          [recipe.id]: {
                            ...getIngredientForm(recipe.id),
                            itemId: e.target.value,
                          },
                        }))
                      }
                      className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">Select item...</option>
                      {items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.unit})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      value={getIngredientForm(recipe.id).quantity}
                      onChange={(e) =>
                        setIngredientForms((prev) => ({
                          ...prev,
                          [recipe.id]: {
                            ...getIngredientForm(recipe.id),
                            quantity: e.target.value,
                          },
                        }))
                      }
                      placeholder="Qty"
                      className="w-24 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <button
                      onClick={() => handleAddIngredient(recipe.id)}
                      className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
                      title="Add ingredient"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Recipes;
